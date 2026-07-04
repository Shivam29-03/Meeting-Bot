import api from "@/lib/axios";
import type {
  CreateMeetingPayload,
  Meeting,
  MeetingDetail,
  TranscriptSegment,
} from "@/lib/meeting-types";

export type { Meeting, CreateMeetingPayload, TranscriptSegment } from "@/lib/meeting-types";

export type MeetingDetailResponse = MeetingDetail & {
  success: boolean;
};

export async function createMeeting(data: CreateMeetingPayload) {
  const response = await api.post<{ success: boolean; meeting: Meeting }>(
    "/api/meetings",
    data,
  );
  return response.data;
}

export async function getMeetings() {
  const response = await api.get<{ success: boolean; meetings: Meeting[] }>(
    "/api/meetings",
  );
  return response.data;
}

export async function getMeetingById(id: string) {
  const response = await api.get<{
    success: boolean;
    meeting: Meeting;
    video_url: string | null;
    duration_seconds: number | null;
    participants: string[];
    transcript: { segments: TranscriptSegment[] };
  }>(`/api/meetings/${id}`);

  const { success, meeting, video_url, duration_seconds, participants, transcript } =
    response.data;

  return {
    success,
    meeting,
    videoUrl: video_url,
    durationSeconds: duration_seconds,
    participants,
    transcriptSegments: transcript.segments,
  } satisfies MeetingDetail & { success: boolean };
}

export async function deleteMeeting(id: string) {
  const response = await api.delete<{ success: boolean }>(`/api/meetings/${id}`);
  return response.data;
}
