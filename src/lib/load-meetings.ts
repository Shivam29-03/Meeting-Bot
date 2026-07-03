import type { Meeting } from "@/lib/meeting-types";
import { getMeetingById, listMeetings } from "@/lib/meeting-repository";

export type MeetingsLoadResult = {
  meetings: Meeting[];
  error: string | null;
};

export type MeetingLoadResult = {
  meeting: Meeting | null;
  error: string | null;
};

function formatDbError(error: unknown): MeetingsLoadResult {
  console.error("Failed to load meetings:", error);

  const message =
    error instanceof Error ? error.message : "Unable to connect to the database";

  if (message.includes("querySrv") || message.includes("ECONNREFUSED")) {
    return {
      meetings: [],
      error:
        "Cannot reach MongoDB. Check your internet connection, MongoDB Atlas cluster status, and MONGODB_URI in .env.local.",
    };
  }

  return {
    meetings: [],
    error: message,
  };
}

export async function loadMeetingsForUser(userId: string): Promise<MeetingsLoadResult> {
  try {
    const meetings = await listMeetings(userId, { syncStatus: false });
    return { meetings, error: null };
  } catch (error) {
    return formatDbError(error);
  }
}

export async function loadMeetingForUser(
  meetingId: string,
  userId: string,
): Promise<MeetingLoadResult> {
  try {
    const meeting = await getMeetingById(meetingId, userId);
    return { meeting, error: null };
  } catch (error) {
    console.error("Failed to load meeting:", error);
    const result = formatDbError(error);
    return { meeting: null, error: result.error };
  }
}
