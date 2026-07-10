import { connectDB } from "@/lib/mongodb";
import { env, isRecapEmailConfigured } from "@/lib/env";
import { ensureMeetingSummary } from "@/lib/ensure-summary";
import { buildRecapEmailContent } from "@/lib/recap-email-content";
import { buildRecapRecipients } from "@/lib/recap-recipients";
import {
  computeOverallRecapState,
  recapIdempotencyKey,
  shouldAttemptDelivery,
  STALE_PROCESSING_MS,
  type RecapDelivery,
  type RecapState,
} from "@/lib/recap-state";
import { sendEmail } from "@/lib/resend";
import { getUserSettings } from "@/lib/user-settings";
import type { TranscriptSegment } from "@/lib/meeting-types";
import Meeting from "@/models/Meeting";
import MeetingTranscript from "@/models/MeetingTranscript";

/**
 * Orchestrates recap email delivery for a single meeting. Idempotent and safe
 * to call repeatedly (Recall webhooks can repeat; `after()` may re-run). All
 * data is loaded strictly by `meetingId` so Meeting A can never receive Meeting
 * B's summary, transcript, or recipients.
 */

export type RecapResultState =
  | RecapState
  | "not_found"
  | "not_claimed"
  | "disabled";

export type RecapResult = {
  meetingId: string;
  state: RecapResultState;
  sent: number;
  failed: number;
  skipped: number;
  total: number;
};

type MeetingLeanForRecap = {
  _id: unknown;
  user_id: string;
  title?: string | null;
  recap_recipients?: string[];
  recap_deliveries?: RecapDelivery[];
};

function truncateError(message: string): string {
  return message.slice(0, 300);
}

function result(
  meetingId: string,
  state: RecapResultState,
  deliveries: RecapDelivery[] = [],
): RecapResult {
  const sent = deliveries.filter((d) => d.status === "sent").length;
  const failed = deliveries.filter((d) => d.status === "failed").length;
  return {
    meetingId,
    state,
    sent,
    failed,
    skipped: deliveries.length - sent - failed,
    total: deliveries.length,
  };
}

async function persistDeliveries(meetingId: string, deliveries: RecapDelivery[]) {
  await Meeting.findByIdAndUpdate(meetingId, { recap_deliveries: deliveries });
}

async function markSkipped(meetingId: string) {
  // Only move fresh/unfinished meetings to "skipped"; never clobber a real
  // "sent"/"partial" outcome from a prior run.
  await Meeting.findOneAndUpdate(
    {
      _id: meetingId,
      $or: [
        { recap_state: { $in: ["pending", "processing"] } },
        { recap_state: { $exists: false } },
      ],
    },
    { recap_state: "skipped", recap_processed_at: new Date() },
  );
}

export async function processMeetingRecap(meetingId: string): Promise<RecapResult> {
  await connectDB();

  const meeting = await Meeting.findById(meetingId).lean<MeetingLeanForRecap>();
  if (!meeting) {
    return result(meetingId, "not_found");
  }

  // --- Feature gates (fail safe: skip, never throw) ---
  // 1) Global Resend config present  2) global kill switch not disabled
  // 3) organizer opted in via their emailRecap setting.
  if (!isRecapEmailConfigured() || !env.recapEmailEnabled) {
    await markSkipped(meetingId);
    return result(meetingId, "disabled");
  }

  const settings = await getUserSettings(meeting.user_id);
  if (!settings.emailRecap) {
    await markSkipped(meetingId);
    return result(meetingId, "disabled");
  }

  // A transcript is required to build a recap.
  const transcriptDoc = await MeetingTranscript.findOne({ meeting_id: meetingId })
    .select("segments")
    .lean<{ segments?: TranscriptSegment[] }>();
  const segments = transcriptDoc?.segments ?? [];
  if (segments.length === 0) {
    return result(meetingId, "skipped");
  }

  // --- Atomic claim ---
  // Eligible: never-run (pending/legacy) or a prior partial/failed run (retry),
  // or a "processing" claim old enough to be considered crashed (stale).
  const staleThreshold = new Date(Date.now() - STALE_PROCESSING_MS);
  const claimed = await Meeting.findOneAndUpdate(
    {
      _id: meetingId,
      $or: [
        { recap_state: { $in: ["pending", "failed", "partial"] } },
        { recap_state: "processing", recap_claimed_at: { $lt: staleThreshold } },
        { recap_state: { $exists: false } },
      ],
    },
    { recap_state: "processing", recap_claimed_at: new Date() },
    { new: true },
  ).lean<MeetingLeanForRecap>();

  if (!claimed) {
    // Already fully sent, skipped, or another worker holds a fresh claim.
    return result(meetingId, "not_claimed");
  }

  // Ensure summary. Best-effort: if OpenAI fails we still deliver the transcript.
  let summary: string | null = null;
  try {
    summary = await ensureMeetingSummary(meetingId);
  } catch {
    console.error(`[Recap] Summary generation failed for meeting ${meetingId}`);
  }

  // Defensively re-derive recipients (validate/normalize/dedupe + organizer).
  const recipients = buildRecapRecipients(
    claimed.recap_recipients ?? [],
    claimed.user_id,
  );
  if (recipients.length === 0) {
    await Meeting.findByIdAndUpdate(meetingId, {
      recap_state: "skipped",
      recap_processed_at: new Date(),
    });
    return result(meetingId, "skipped");
  }

  // Merge prior per-recipient state (retry) with the current recipient set.
  const existingByEmail = new Map(
    (claimed.recap_deliveries ?? []).map((delivery) => [delivery.email, delivery]),
  );
  const deliveries: RecapDelivery[] = recipients.map(
    (email) =>
      existingByEmail.get(email) ?? {
        email,
        status: "queued",
        attempts: 0,
        provider_message_id: null,
        last_error: null,
        sent_at: null,
      },
  );

  const content = buildRecapEmailContent({
    title: claimed.title ?? "Your meeting",
    summary,
    segments,
  });

  // One private email per recipient (never To/CC roster leakage).
  for (const delivery of deliveries) {
    if (!shouldAttemptDelivery(delivery)) {
      continue; // already sent, or exhausted retry budget
    }

    delivery.attempts += 1;
    try {
      const sendResult = await sendEmail({
        to: delivery.email,
        subject: content.subject,
        html: content.html,
        text: content.text,
        attachments: content.attachments,
        idempotencyKey: recapIdempotencyKey(meetingId, delivery.email),
      });
      delivery.status = "sent";
      delivery.provider_message_id = sendResult.id;
      delivery.last_error = null;
      delivery.sent_at = new Date();
    } catch (error) {
      delivery.status = "failed";
      delivery.last_error = truncateError(
        error instanceof Error ? error.message : "send failed",
      );
    }

    // Persist immediately so a crash mid-loop never re-sends a delivered email.
    await persistDeliveries(meetingId, deliveries);
  }

  const overall = computeOverallRecapState(deliveries);
  await Meeting.findByIdAndUpdate(meetingId, {
    recap_state: overall,
    recap_deliveries: deliveries,
    recap_processed_at: new Date(),
  });

  return result(meetingId, overall, deliveries);
}
