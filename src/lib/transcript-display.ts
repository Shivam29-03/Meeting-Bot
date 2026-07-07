import type { TranscriptSegment } from "@/lib/meeting-types";

export type DisplayTranscriptEntry = {
  speaker: string;
  speaker_id: number;
  start: number;
  end: number;
  text: string;
  sourceIndex: number;
};

const MAX_WORDS_PER_ENTRY = 40;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function splitAtSentences(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  if (!parts) {
    return [text.trim()].filter(Boolean);
  }
  return parts.map((part) => part.trim()).filter(Boolean);
}

function interpolateEntry(
  segment: TranscriptSegment,
  sourceIndex: number,
  text: string,
  wordStart: number,
  wordEnd: number,
  totalWords: number,
): DisplayTranscriptEntry {
  const duration = Math.max(0, segment.end - segment.start);
  const start =
    totalWords === 0
      ? segment.start
      : segment.start + (wordStart / totalWords) * duration;
  const end =
    totalWords === 0
      ? segment.end
      : segment.start + (wordEnd / totalWords) * duration;

  return {
    speaker: segment.speaker,
    speaker_id: segment.speaker_id,
    start,
    end,
    text,
    sourceIndex,
  };
}

function splitSegment(
  segment: TranscriptSegment,
  sourceIndex: number,
): DisplayTranscriptEntry[] {
  const text = segment.text.trim();
  if (!text) {
    return [];
  }

  const totalWords = countWords(text);
  if (totalWords <= MAX_WORDS_PER_ENTRY) {
    return [
      {
        speaker: segment.speaker,
        speaker_id: segment.speaker_id,
        start: segment.start,
        end: segment.end,
        text,
        sourceIndex,
      },
    ];
  }

  const sentences = splitAtSentences(text);
  const entries: DisplayTranscriptEntry[] = [];
  let wordOffset = 0;

  for (const sentence of sentences) {
    const sentenceWords = countWords(sentence);
    entries.push(
      interpolateEntry(
        segment,
        sourceIndex,
        sentence,
        wordOffset,
        wordOffset + sentenceWords,
        totalWords,
      ),
    );
    wordOffset += sentenceWords;
  }

  return entries;
}

export function buildDisplayTranscript(
  segments: TranscriptSegment[],
): DisplayTranscriptEntry[] {
  return segments.flatMap((segment, sourceIndex) =>
    splitSegment(segment, sourceIndex),
  );
}

type IndexedDisplayEntry = {
  entry: DisplayTranscriptEntry;
  displayIndex: number;
};

export function findActiveDisplayIndex(
  entries: DisplayTranscriptEntry[],
  currentTime: number,
  pointer: number,
): { index: number | null; pointer: number } {
  if (entries.length === 0) {
    return { index: null, pointer: 0 };
  }

  let i = pointer;
  while (i < entries.length && currentTime > entries[i].end) {
    i++;
  }
  while (i > 0 && currentTime < entries[i].start) {
    i--;
  }

  const match = entries[i];
  if (
    match &&
    currentTime >= match.start &&
    currentTime <= match.end
  ) {
    return { index: i, pointer: i };
  }

  return { index: null, pointer: i };
}

export function sortDisplayEntriesByTime(
  entries: DisplayTranscriptEntry[],
): IndexedDisplayEntry[] {
  return entries
    .map((entry, displayIndex) => ({ entry, displayIndex }))
    .sort((a, b) => a.entry.start - b.entry.start);
}
