import type { Meeting, MeetingStatus } from "@/lib/meeting-types";

const seedMeetings: Meeting[] = [
  {
    id: "2",
    title: "Product Review",
    meetUrl: "https://meet.google.com/xyz-uvwq-rst",
    createdAt: "2026-04-20T20:00:00.000Z",
    status: "joining",
  },
  {
    id: "3",
    title: "Client Demo",
    meetUrl: "https://meet.google.com/lmn-opqr-stu",
    createdAt: "2026-04-19T14:45:00.000Z",
    status: "recording",
  },
  {
    id: "4",
    title: "Sprint Retro",
    meetUrl: "https://meet.google.com/aaa-bbbb-ccc",
    createdAt: "2026-04-18T21:30:00.000Z",
    status: "completed",
  },
  {
    id: "5",
    title: "All Hands",
    meetUrl: "https://meet.google.com/ddd-eeee-fff",
    createdAt: "2026-04-17T16:30:00.000Z",
    status: "failed",
  },
];

let meetings: Meeting[] = [...seedMeetings];

function titleFromUrl(url: string) {
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

export function listMeetings() {
  return [...meetings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getMeetingById(id: string) {
  return meetings.find((meeting) => meeting.id === id) ?? null;
}

export function createMeeting(input: {
  meetUrl: string;
  title?: string;
  createdBy?: string;
}) {
  const meeting: Meeting = {
    id: crypto.randomUUID(),
    title: input.title?.trim() || titleFromUrl(input.meetUrl),
    meetUrl: input.meetUrl,
    createdAt: new Date().toISOString(),
    status: "requested",
    createdBy: input.createdBy,
  };

  meetings = [meeting, ...meetings];
  return meeting;
}

export function deleteMeeting(id: string) {
  const previousLength = meetings.length;
  meetings = meetings.filter((meeting) => meeting.id !== id);
  return meetings.length < previousLength;
}

export function countByStatus(status: MeetingStatus) {
  return meetings.filter((meeting) => meeting.status === status).length;
}
