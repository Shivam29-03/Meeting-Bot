import type { TranscriptSegment } from "@/lib/meeting-types";
import { sanitizeMeetingFileName } from "@/lib/meeting-file-name";

function formatTimestamp(seconds: number) {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function buildTranscriptText(meetingTitle: string, segments: TranscriptSegment[]) {
  const header = [
    meetingTitle,
    `Exported ${new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date())}`,
    "",
  ];

  const body = segments.map(
    (segment) => `[${formatTimestamp(segment.start)}] ${segment.speaker}: ${segment.text}`,
  );

  return [...header, ...body].join("\n");
}

export function downloadTranscriptFile(meetingTitle: string, segments: TranscriptSegment[]) {
  if (segments.length === 0) {
    return;
  }

  const content = buildTranscriptText(meetingTitle, segments);
  const fileName = `${sanitizeMeetingFileName(meetingTitle)}-transcript.txt`;
  downloadBlob(new Blob([content], { type: "text/plain;charset=utf-8" }), fileName);
}

export async function downloadMeetingExport({
  meetingId,
  meetingTitle,
  segments,
  hasVideo,
}: {
  meetingId: string;
  meetingTitle: string;
  segments: TranscriptSegment[];
  hasVideo: boolean;
}) {
  const baseName = sanitizeMeetingFileName(meetingTitle);

  if (segments.length > 0) {
    downloadTranscriptFile(meetingTitle, segments);
  }

  if (!hasVideo) {
    return;
  }

  const response = await fetch(`/api/meetings/${meetingId}/video`);
  if (!response.ok) {
    throw new Error("Failed to download video");
  }

  const blob = await response.blob();
  downloadBlob(blob, `${baseName}-recording.mp4`);
}
