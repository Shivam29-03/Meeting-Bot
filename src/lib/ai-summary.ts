import axios from "axios";

import { env } from "@/lib/env";
import type { TranscriptSegment } from "@/lib/meeting-types";

const OPENAI_API_URL = "https://api.openai.com/v1/responses";

function formatTranscript(segments: TranscriptSegment[]): string {
    return segments
        .filter((segment) => segment.text.trim().length > 0)
        .map(
            (segment) =>
                `${segment.speaker || "Unknown"}:\n${segment.text.trim()}`,
        )
        .join("\n\n");
}

function buildPrompt(transcript: string): string {
    return `
  You are an Enterprise AI Meeting Assistant.
  
  Your job is to convert a meeting transcript into a concise, executive-ready summary.
  
  IMPORTANT GUIDELINES
  
  - Use ONLY information from the transcript.
  - Never invent facts, names, deadlines, or decisions.
  - Remove greetings, filler words, repeated discussions, corrections, and off-topic conversations.
  - Merge repeated points into one.
  - Prefer concise business language.
  - Maximum total length: 350-500 words.
  - Write naturally, not like AI-generated text.
  - Use clean Markdown.
  - Do NOT include empty sections.
  - Do NOT repeat the same information in multiple sections.
  
  Return the following sections in this exact order.
  
  # Executive Summary
  
  Write ONE short paragraph (3-5 sentences).
  
  Summarize:
  - what the meeting was about
  - what was accomplished
  - what the overall outcome was
  
  Keep this under 120 words.
  
  ---
  
  # Key Highlights
  
  Provide 4-8 concise bullet points.
  
  Each bullet should contain one important discussion only.
  
  Avoid long paragraphs.
  
  ---
  
  # Decisions
  
  List only final decisions.
  
  If no decisions were made, write:
  
  - No final decisions were recorded.
  
  ---
  
  # Action Items
  
  Return a markdown table.
  
  | Owner | Task | Status |
  |-------|------|--------|
  
  Rules:
  
  - One row per task.
  - Owner should be extracted if mentioned.
  - If unknown use "Unassigned".
  - Status should be:
    - Pending
    - In Progress
    - Completed
  
  Do NOT invent deadlines.
  
  ---
  
  # Risks / Follow-ups
  
  Include ONLY if applicable.
  
  Maximum 5 bullets.
  
  Include:
  - blockers
  - open questions
  - dependencies
  - follow-up work
  
  If none exist, omit this section entirely.
  
  Meeting Transcript:
  
  ${transcript}
  `;
  }

export async function generateMeetingSummary(
    segments: TranscriptSegment[],
): Promise<string> {
    if (segments.length === 0) {
        return "";
    }

    const transcript = formatTranscript(segments);

    try {
        const response = await axios.post(
            OPENAI_API_URL,
            {
                model: "gpt-5-mini",
                input: buildPrompt(transcript),
            },
            {
                headers: {
                    Authorization: `Bearer ${env.openaiApiKey}`,
                    "Content-Type": "application/json",
                },
            },
        );

        const summary =
            response.data.output_text?.trim() ??
            response.data.output
                ?.find((o: any) => o.type === "message")
                ?.content?.find((c: any) => c.type === "output_text")
                ?.text?.trim() ??
            "";

        if (!summary) {
            throw new Error("OpenAI returned an empty summary.");
        }

        return summary;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(
                "[AI Summary] OpenAI Error:",
                error.response?.data ?? error.message,
            );
        } else {
            console.error("[AI Summary] Failed to generate summary:", error);
        }

        throw new Error("Failed to generate AI summary.");
    }
}