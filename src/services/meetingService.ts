import api from "@/lib/axios";
import type { CreateMeetingPayload, Meeting } from "@/lib/meeting-types";

export type { Meeting, CreateMeetingPayload } from "@/lib/meeting-types";

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
  const response = await api.get<{ success: boolean; meeting: Meeting }>(
    `/api/meetings/${id}`,
  );
  return response.data;
}

export async function deleteMeeting(id: string) {
  const response = await api.delete<{ success: boolean }>(`/api/meetings/${id}`);
  return response.data;
}
