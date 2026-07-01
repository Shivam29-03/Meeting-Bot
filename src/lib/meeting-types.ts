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
  status: MeetingStatus;
  createdBy?: string;
};

export type CreateMeetingPayload = {
  title?: string;
  meetUrl: string;
};
