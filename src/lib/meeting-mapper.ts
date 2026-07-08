import type { Meeting, MeetingStatus } from "@/lib/meeting-types";
import type { MeetingStatus as DbMeetingStatus } from "@/types/meeting";

type MeetingDocument = {
  _id: { toString(): string };
  meeting_url: string;
  title?: string | null;
  status: DbMeetingStatus;
  sub_code?: string | null;
  created_at?: Date;
  updated_at?: Date;
  user_id: string;
  bot_id: string;
};

const dbToAppStatus: Record<DbMeetingStatus, MeetingStatus> = {
  requested: "requested",
  joining: "joining",
  in_call: "recording",
  recording: "recording",
  done: "completed",
  failed: "failed",
};

export function toMeetingDto(doc: MeetingDocument): Meeting {
  return {
    id: doc._id.toString(),
    title: doc.title?.trim() || titleFromUrl(doc.meeting_url),
    meetUrl: doc.meeting_url,
    createdAt: (doc.created_at ?? new Date()).toISOString(),
    updatedAt: (doc.updated_at ?? doc.created_at ?? new Date()).toISOString(),
    status: dbToAppStatus[doc.status],
    subCode: doc.sub_code ?? null,
    failureReason: doc.status === "failed" ? doc.sub_code ?? null : null,
    createdBy: doc.user_id,
  };
}

export function titleFromUrl(url: string) {
  try {
    const hostname = new URL(url).hostname;
    if (hostname.includes("meet.google")) return "Google Meet";
    if (hostname.includes("zoom")) return "Zoom Meeting";
    if (hostname.includes("teams")) return "Teams Meeting";
  } catch {
    // fall through
  }
  return "New Meeting";
}
