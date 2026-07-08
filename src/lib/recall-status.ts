import type { MeetingStatus as DbMeetingStatus } from "@/types/meeting";
import type { RecallBotDetails } from "@/lib/recall";

const recallCodeToDbStatus: Record<string, DbMeetingStatus> = {
  joining_call: "joining",
  in_waiting_room: "joining",
  in_call_not_recording: "in_call",
  recording_permission_allowed: "in_call",
  recording_permission_denied: "in_call",
  in_call_recording: "recording",
  call_ended: "done",
  done: "done",
  fatal: "failed",
  analysis_done: "done",
  analysis_failed: "failed",
};

export function mapRecallCodeToDbStatus(code: string): DbMeetingStatus | null {
  const normalized = code.replace(/^bot\./, "");
  return recallCodeToDbStatus[normalized] ?? null;
}

export const recallEventToDbStatus: Record<string, DbMeetingStatus> = {
  "bot.joining_call": "joining",
  "bot.in_waiting_room": "joining",
  "bot.in_call_not_recording": "in_call",
  "bot.recording_permission_allowed": "in_call",
  "bot.recording_permission_denied": "in_call",
  "bot.in_call_recording": "recording",
  "bot.call_ended": "done",
  "bot.done": "done",
  "bot.fatal": "failed",
  "bot.analysis_done": "done",
  "bot.analysis_failed": "failed",
};

export const activeDbStatuses: DbMeetingStatus[] = [
  "requested",
  "joining",
  "in_call",
  "recording",
];

const IN_CALL_CODES = [
  "in_call_not_recording",
  "recording_permission_allowed",
  "recording_permission_denied",
  "in_call_recording",
];

/**
 * Whether the bot ever actually started recording (has a recording, or reached
 * the in_call_recording state at some point in its history).
 */
export function botEverRecorded(bot: RecallBotDetails): boolean {
  if (bot.recordings?.some((recording) => recording.id)) {
    return true;
  }
  const changes = bot.status_changes ?? [];
  return changes.some((change) => normalizeCode(change.code) === "in_call_recording");
}

function normalizeCode(code: string): string {
  return code.replace(/^bot\./, "");
}

/**
 * Derives a human-mappable failure reason code from a bot's event history for a
 * meeting that ended without ever recording.
 */
export function deriveFailureReason(bot: RecallBotDetails): string {
  const changes = bot.status_changes ?? [];
  const codes = changes.map((change) => normalizeCode(change.code));

  const fatal = [...changes]
    .reverse()
    .find((change) => normalizeCode(change.code) === "fatal");
  if (fatal) {
    const sub = fatal.sub_code ?? "";
    if (sub === "google_meet_bot_blocked") return "bot_blocked";
    if (
      sub === "google_meet.login_required" ||
      sub === "google_meet_login_not_available"
    ) {
      return "login_required";
    }
    if (sub) return sub;
  }

  if (codes.includes("recording_permission_denied")) {
    return "recording_denied";
  }

  const reachedInCall = codes.some((code) => IN_CALL_CODES.includes(code));
  if (codes.includes("in_waiting_room") && !reachedInCall) {
    return "denied_entry";
  }

  return "no_recording";
}
