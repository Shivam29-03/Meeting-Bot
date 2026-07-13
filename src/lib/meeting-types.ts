export type MeetingStatus =
  | "requested"
  | "joining"
  | "recording"
  | "completed"
  | "failed";

export type Meeting = {
  id: string;
  title: string;
  meetUrl: string;
  createdAt: string;
  updatedAt?: string;
  status: MeetingStatus;
  subCode?: string | null;
  failureReason?: string | null;
  createdBy?: string;
};

export type TranscriptSegment = {
  speaker: string;
  speaker_id: number;
  start: number;
  end: number;
  text: string;
};

export type MeetingDetail = {
  meeting: Meeting;
  videoUrl: string | null;
  transcriptSegments: TranscriptSegment[];
  durationSeconds: number | null;
  participants: string[];
  aiSummary: string | null;
};

export type CreateMeetingPayload = {
  title?: string;
  meetUrl: string;
  recipientEmails?: string[];
};
