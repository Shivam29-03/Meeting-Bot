"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui";
import type { Meeting } from "@/lib/meeting-types";
import {
  getSpeakerInitials,
  speakerBackground,
} from "@/lib/speaker-utils";
import type { DisplayTranscriptEntry } from "@/lib/transcript-display";
import { cn } from "@/lib/utils";

type MeetingTranscriptPanelProps = {
  meeting: Meeting;
  displayEntries: DisplayTranscriptEntry[];
  activeDisplayIndex: number | null;
  hasVideo: boolean;
  onSeek: (entry: DisplayTranscriptEntry, displayIndex: number) => void;
  fillHeight?: boolean;
};

function formatTimestamp(seconds: number) {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
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
  displayEntries,
  activeDisplayIndex,
  hasVideo,
  onSeek,
  fillHeight = false,
}: MeetingTranscriptPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const entryRefs = useRef<Array<HTMLDivElement | null>>([]);

  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return displayEntries.map((entry, displayIndex) => ({
        entry,
        displayIndex,
      }));
    }

    return displayEntries
      .map((entry, displayIndex) => ({ entry, displayIndex }))
      .filter(
        ({ entry }) =>
          entry.speaker.toLowerCase().includes(query) ||
          entry.text.toLowerCase().includes(query),
      );
  }, [searchQuery, displayEntries]);

  const handleEntryClick = useCallback(
    (entry: DisplayTranscriptEntry, displayIndex: number) => {
      onSeek(entry, displayIndex);
    },
    [onSeek],
  );

  if (displayEntries.length === 0) {
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
    <div className={cn("flex flex-col", fillHeight && "min-h-0 flex-1")}>
      <div className="shrink-0 border-b border-slate-200 px-4 py-3 sm:px-5">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search transcript"
            className="h-9 rounded-lg border-slate-200 bg-slate-50 pl-9 shadow-none focus-visible:ring-1 focus-visible:ring-primary/30"
          />
        </div>
      </div>

      <div
        className={cn(
          "overflow-y-auto px-4 py-2 sm:px-5",
          fillHeight ? "min-h-0 flex-1" : "max-h-[520px]",
        )}
      >
        {filteredEntries.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No transcript lines match your search.
          </p>
        ) : (
          <div className="space-y-1">
            {filteredEntries.map(({ entry, displayIndex }) => (
              <div
                key={`${entry.speaker_id}-${entry.start}-${displayIndex}`}
                ref={(element) => {
                  entryRefs.current[displayIndex] = element;
                }}
                role={hasVideo ? "button" : undefined}
                tabIndex={hasVideo ? 0 : undefined}
                onClick={
                  hasVideo
                    ? () => handleEntryClick(entry, displayIndex)
                    : undefined
                }
                onKeyDown={
                  hasVideo
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleEntryClick(entry, displayIndex);
                        }
                      }
                    : undefined
                }
                className={cn(
                  "flex gap-3 rounded-lg px-2 py-3 transition-colors",
                  hasVideo && "cursor-pointer hover:bg-slate-50",
                  activeDisplayIndex === displayIndex && "bg-primary/5",
                )}
              >
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: speakerBackground(entry.speaker) }}
                >
                  {getSpeakerInitials(entry.speaker)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <span className="font-medium text-foreground">
                      {entry.speaker}
                    </span>
                    {hasVideo ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleEntryClick(entry, displayIndex);
                        }}
                        className="font-medium text-primary underline-offset-2 hover:underline"
                      >
                        {formatTimestamp(entry.start)}
                      </button>
                    ) : (
                      <span className="text-primary">
                        {formatTimestamp(entry.start)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                    {entry.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
