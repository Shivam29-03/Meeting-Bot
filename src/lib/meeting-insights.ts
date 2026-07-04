import type { Meeting, TranscriptSegment } from "@/lib/meeting-types";
import type { RecallBotDetails } from "@/lib/recall";

const ACTIVE_STATUSES = new Set<Meeting["status"]>(["requested", "joining", "recording"]);

type RecallParticipant = {
  id?: number;
  name?: string | null;
};

export function deriveParticipantsFromSegments(segments: TranscriptSegment[]): string[] {
  return [...new Set(segments.map((segment) => segment.speaker).filter(Boolean))];
}

export async function fetchRecallParticipants(
  participantsDownloadUrl: string | null | undefined,
): Promise<string[]> {
  if (!participantsDownloadUrl) {
    return [];
  }

  try {
    const response = await fetch(participantsDownloadUrl);
    if (!response.ok) {
      return [];
    }

    const participants = (await response.json()) as RecallParticipant[];

    return [
      ...new Set(
        participants
          .map((participant) =>
            participant.name?.trim() ||
            (participant.id !== undefined ? `Participant ${participant.id}` : null),
          )
          .filter((name): name is string => Boolean(name)),
      ),
    ];
  } catch (error) {
    console.error("[Meeting Insights] Failed to fetch Recall participants:", error);
    return [];
  }
}

export function deriveDurationFromRecording(
  startedAt?: string | null,
  completedAt?: string | null,
): number | null {
  if (!startedAt) {
    return null;
  }

  const startMs = new Date(startedAt).getTime();
  const endMs = completedAt ? new Date(completedAt).getTime() : Date.now();
  const seconds = Math.floor((endMs - startMs) / 1000);

  return seconds > 0 ? seconds : null;
}

export function deriveDurationFromMeetingTimestamps(meeting: Meeting): number | null {
  const end = meeting.updatedAt ?? meeting.createdAt;
  const seconds = Math.floor(
    (new Date(end).getTime() - new Date(meeting.createdAt).getTime()) / 1000,
  );

  return seconds > 0 ? seconds : null;
}

export function resolveMeetingParticipants(
  recallParticipants: string[],
  transcriptSegments: TranscriptSegment[],
): string[] {
  if (recallParticipants.length > 0) {
    return recallParticipants;
  }

  return deriveParticipantsFromSegments(transcriptSegments);
}

export function resolveMeetingDurationSeconds(
  meeting: Meeting,
  recordingDurationSeconds: number | null,
  transcriptSegments: TranscriptSegment[],
): number | null {
  if (recordingDurationSeconds !== null) {
    return recordingDurationSeconds;
  }

  if (transcriptSegments.length > 0) {
    return transcriptSegments[transcriptSegments.length - 1].end;
  }

  if (ACTIVE_STATUSES.has(meeting.status)) {
    return Math.max(1, Math.floor((Date.now() - new Date(meeting.createdAt).getTime()) / 1000));
  }

  if (meeting.status === "completed" || meeting.status === "failed") {
    return deriveDurationFromMeetingTimestamps(meeting);
  }

  return null;
}

export function extractBotRecordingInsights(botDetails: RecallBotDetails) {
  const recording = botDetails.recordings?.[0];

  const videoUrl =
    recording?.media_shortcuts?.video_mixed?.data?.download_url ??
    recording?.media_shortcuts?.video_mixed_mp4?.data?.download_url ??
    recording?.media_shortcuts?.video_mixed?.download_url ??
    null;

  const durationSeconds = deriveDurationFromRecording(
    recording?.started_at,
    recording?.completed_at,
  );

  const participantsDownloadUrl =
    recording?.media_shortcuts?.participant_events?.data?.participants_download_url ?? null;

  return {
    videoUrl,
    durationSeconds,
    participantsDownloadUrl,
  };
}
