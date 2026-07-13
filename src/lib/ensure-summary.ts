import { connectDB } from "@/lib/mongodb";
import { generateMeetingSummary } from "@/lib/ai-summary";
import type { TranscriptSegment } from "@/lib/meeting-types";
import Meeting from "@/models/Meeting";
import MeetingTranscript from "@/models/MeetingTranscript";

/**
 * Returns the AI summary for a single meeting, generating and persisting it
 * once if it does not already exist. Shared by the dashboard (lazy view) and
 * the recap email orchestrator so the OpenAI prompt logic lives in exactly one
 * place ([ai-summary.ts]).
 *
 * Concurrency: two callers (e.g. a dashboard view and the recap job) can race.
 * We persist with a conditional update so only the first writer wins; a losing
 * writer re-reads and returns the stored summary. Both may call OpenAI once,
 * which is wasteful but never produces an incorrect or duplicated summary.
 *
 * Isolation: every read/write is keyed by this meetingId only.
 * Privacy: transcript text is never logged.
 */
export async function ensureMeetingSummary(
  meetingId: string,
): Promise<string | null> {
  await connectDB();

  const existing = await Meeting.findById(meetingId)
    .select("ai_summary")
    .lean<{ ai_summary?: string | null }>();

  if (!existing) {
    return null;
  }
  if (existing.ai_summary) {
    return existing.ai_summary;
  }

  const transcriptDoc = await MeetingTranscript.findOne({ meeting_id: meetingId })
    .select("segments")
    .lean<{ segments?: TranscriptSegment[] }>();

  const segments = transcriptDoc?.segments ?? [];
  if (segments.length === 0) {
    return null;
  }

  const summary = await generateMeetingSummary(segments);
  if (!summary) {
    return null;
  }

  // Only the first writer sets ai_summary; a concurrent winner is respected.
  const updated = await Meeting.findOneAndUpdate(
    {
      _id: meetingId,
      $or: [{ ai_summary: null }, { ai_summary: { $exists: false } }],
    },
    { ai_summary: summary, ai_summary_generated_at: new Date() },
    { new: true },
  )
    .select("ai_summary")
    .lean<{ ai_summary?: string | null }>();

  if (updated?.ai_summary) {
    return updated.ai_summary;
  }

  // Lost the race: return whatever the winner persisted.
  const current = await Meeting.findById(meetingId)
    .select("ai_summary")
    .lean<{ ai_summary?: string | null }>();
  return current?.ai_summary ?? summary;
}
