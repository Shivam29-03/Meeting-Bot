"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

import { Button, Input } from "@/components/ui";
import type { Meeting, TranscriptSegment } from "@/lib/meeting-types";
import { cn } from "@/lib/utils";

const SPEAKER_AVATAR_COLORS = [
  "bg-emerald-500",
  "bg-amber-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-indigo-500",
];

type MeetingTranscriptPanelProps = {
  meeting: Meeting;
  segments: TranscriptSegment[];
  activeSegmentIndex: number | null;
  hasVideo: boolean;
  onSeek: (segment: TranscriptSegment, index: number) => void;
};

function formatTimestamp(seconds: number) {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function getSpeakerInitial(speaker: string) {
  const trimmed = speaker.trim();
  if (!trimmed) {
    return "?";
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length > 1) {
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }

  return trimmed[0]?.toUpperCase() ?? "?";
}

function getSpeakerAvatarColor(speaker: string, colorMap: Map<string, string>) {
  if (!colorMap.has(speaker)) {
    colorMap.set(
      speaker,
      SPEAKER_AVATAR_COLORS[colorMap.size % SPEAKER_AVATAR_COLORS.length],
    );
  }

  return colorMap.get(speaker)!;
}

function EmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center",
        className,
      )}
    >
      <p className="text-sm font-medium text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function MeetingTranscriptPanel({
  meeting,
  segments,
  activeSegmentIndex,
  hasVideo,
  onSeek,
}: MeetingTranscriptPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [syncWithAudio, setSyncWithAudio] = useState(hasVideo);
  const segmentRefs = useRef<Array<HTMLDivElement | null>>([]);
  const speakerColors = useMemo(() => new Map<string, string>(), []);

  const filteredSegments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return segments.map((segment, index) => ({ segment, index }));
    }

    return segments
      .map((segment, index) => ({ segment, index }))
      .filter(
        ({ segment }) =>
          segment.speaker.toLowerCase().includes(query) ||
          segment.text.toLowerCase().includes(query),
      );
  }, [searchQuery, segments]);

  useEffect(() => {
    if (!syncWithAudio || activeSegmentIndex === null) {
      return;
    }

    segmentRefs.current[activeSegmentIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeSegmentIndex, syncWithAudio]);

  if (segments.length === 0) {
    if (meeting.status === "completed") {
      return (
        <EmptyState
          title="Transcript processing"
          description="Your transcript will appear here once Recall finishes processing the recording."
        />
      );
    }

    if (meeting.status === "failed") {
      return (
        <EmptyState
          title="Transcript unavailable"
          description="This meeting did not complete successfully, so no transcript was generated."
          className="border-red-200 bg-red-50"
        />
      );
    }

    return (
      <EmptyState
        title="Waiting for transcript"
        description="Transcript segments will appear here as the meeting is processed."
      />
    );
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Find or Replace"
            className="h-9 rounded-lg border-slate-200 bg-slate-50 pl-9 shadow-none focus-visible:ring-1 focus-visible:ring-primary/30"
          />
        </div>
      </div>

      <div className="max-h-[520px] overflow-y-auto px-4 py-2 sm:px-5">
        {filteredSegments.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No transcript lines match your search.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredSegments.map(({ segment, index }) => (
              <div
                key={`${segment.speaker_id}-${segment.start}-${index}`}
                ref={(element) => {
                  segmentRefs.current[index] = element;
                }}
                className={cn(
                  "flex gap-3 py-4 transition-colors",
                  activeSegmentIndex === index && "rounded-lg bg-primary/5 px-2 -mx-2",
                )}
              >
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold text-white",
                    getSpeakerAvatarColor(segment.speaker, speakerColors),
                  )}
                >
                  {getSpeakerInitial(segment.speaker)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 text-sm">
                    <span className="font-medium text-foreground">{segment.speaker}</span>
                    <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    <span className="text-muted-foreground">·</span>
                    {hasVideo ? (
                      <button
                        type="button"
                        onClick={() => onSeek(segment, index)}
                        className="font-medium text-primary underline-offset-2 hover:underline"
                      >
                        {formatTimestamp(segment.start)}
                      </button>
                    ) : (
                      <span className="text-primary">{formatTimestamp(segment.start)}</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-foreground">{segment.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {hasVideo ? (
        <div className="flex justify-center border-t border-slate-100 px-4 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full px-4 shadow-sm"
            onClick={() => setSyncWithAudio((current) => !current)}
          >
            <ChevronUp className="size-4" />
            {syncWithAudio ? "Sync with audio on" : "Sync with audio"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
