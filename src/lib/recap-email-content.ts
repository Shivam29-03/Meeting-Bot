import { buildTranscriptText } from "@/lib/meeting-export";
import { sanitizeMeetingFileName } from "@/lib/meeting-file-name";
import type { TranscriptSegment } from "@/lib/meeting-types";
import type { EmailAttachment } from "@/lib/resend";

/**
 * Builds the V1 recap email: AI summary inline, transcript as a .txt
 * attachment, no video. Pure (no DB / no network) and unit-testable.
 *
 * Security: all dynamic content (title, summary) is HTML-escaped. The summary
 * is model-generated Markdown; rather than rendering it as HTML (an injection
 * surface), we escape it and preserve whitespace with `white-space: pre-wrap`.
 * Raw Recall URLs and internal identifiers are never included.
 */

// Guard against pathologically large transcripts in an email attachment.
const MAX_TRANSCRIPT_ATTACHMENT_CHARS = 2_000_000;

export type RecapEmailInput = {
  title: string;
  summary: string | null;
  segments: TranscriptSegment[];
};

export type RecapEmailContent = {
  subject: string;
  html: string;
  text: string;
  attachments: EmailAttachment[];
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function capTranscript(text: string): string {
  if (text.length <= MAX_TRANSCRIPT_ATTACHMENT_CHARS) {
    return text;
  }
  return (
    text.slice(0, MAX_TRANSCRIPT_ATTACHMENT_CHARS) +
    "\n\n[Transcript truncated for email delivery.]"
  );
}

export function buildRecapEmailContent(input: RecapEmailInput): RecapEmailContent {
  const safeTitle = input.title?.trim() || "Your meeting";
  const subject = `Meeting Recap — ${safeTitle}`;

  const summaryText = input.summary?.trim() || "No summary is available for this meeting.";
  const hasTranscript = input.segments.length > 0;

  const escapedTitle = escapeHtml(safeTitle);
  const escapedSummary = escapeHtml(summaryText);

  const transcriptNote = hasTranscript
    ? "The full transcript is attached as a text file."
    : "No transcript was captured for this meeting.";

  const html = `<!-- recap email -->
<div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #0f172a; max-width: 640px; margin: 0 auto;">
  <h1 style="font-size: 20px; margin: 0 0 4px;">Meeting Recap</h1>
  <p style="font-size: 15px; font-weight: 600; margin: 0 0 16px;">${escapedTitle}</p>
  <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.5; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">${escapedSummary}</div>
  <p style="font-size: 13px; color: #475569; margin: 16px 0 0;">${escapeHtml(transcriptNote)}</p>
</div>`;

  const text = [
    "Meeting Recap",
    safeTitle,
    "",
    summaryText,
    "",
    transcriptNote,
  ].join("\n");

  const attachments: EmailAttachment[] = [];
  if (hasTranscript) {
    attachments.push({
      filename: `${sanitizeMeetingFileName(safeTitle)}-transcript.txt`,
      content: capTranscript(buildTranscriptText(safeTitle, input.segments)),
    });
  }

  return { subject, html, text, attachments };
}
