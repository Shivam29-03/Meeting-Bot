import type { MeetingStatus as DbMeetingStatus } from "@/types/meeting";

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
