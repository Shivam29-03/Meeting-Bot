import { getMeetingById } from "@/lib/meeting-repository";
import {
  extractBotRecordingInsights,
  fetchRecallParticipants,
  resolveMeetingDurationSeconds,
  resolveMeetingParticipants,
} from "@/lib/meeting-insights";
import type { MeetingDetail, TranscriptSegment } from "@/lib/meeting-types";
import { getRecallBot } from "@/lib/recall";
import Meeting from "@/models/Meeting";
import MeetingTranscript from "@/models/MeetingTranscript";

async function fetchTranscriptSegments(meetingId: string): Promise<TranscriptSegment[]> {
  try {
    const transcriptDoc = await MeetingTranscript.findOne({
      meeting_id: meetingId,
    }).lean();

    if (!transcriptDoc?.segments?.length) {
      return [];
    }

    return transcriptDoc.segments as TranscriptSegment[];
  } catch (error) {
    console.error("[Meeting Detail] Failed to fetch transcript segments from DB:", error);
    return [];
  }
}

export async function getMeetingDetail(
  id: string,
  userId: string,
): Promise<MeetingDetail | null> {
  const meeting = await getMeetingById(id, userId);
  if (!meeting) {
    return null;
  }

  const meetingDoc = await Meeting.findById(id).lean();
  if (!meetingDoc) {
    return null;
  }

  const transcriptSegments = await fetchTranscriptSegments(meetingDoc._id.toString());

  let videoUrl: string | null = null;
  let recordingDurationSeconds: number | null = null;
  let recallParticipants: string[] = [];

  if (meetingDoc.bot_id) {
    try {
      const botDetails = await getRecallBot(meetingDoc.bot_id);
      const insights = extractBotRecordingInsights(botDetails);

      videoUrl = insights.videoUrl;
      recordingDurationSeconds = insights.durationSeconds;
      recallParticipants = await fetchRecallParticipants(insights.participantsDownloadUrl);
    } catch (error) {
      console.error(
        `[Meeting Detail] Failed to fetch Recall metadata for bot ${meetingDoc.bot_id}:`,
        error,
      );
    }
  }

  const participants = resolveMeetingParticipants(recallParticipants, transcriptSegments);
  const durationSeconds = resolveMeetingDurationSeconds(
    meeting,
    recordingDurationSeconds,
    transcriptSegments,
  );

  return {
    meeting,
    videoUrl,
    transcriptSegments,
    durationSeconds,
    participants,
  };
}
