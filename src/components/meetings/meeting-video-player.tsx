"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
import {
  Download,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";

import {
  findActiveDisplayIndex,
  sortDisplayEntriesByTime,
  type DisplayTranscriptEntry,
} from "@/lib/transcript-display";
import { cn } from "@/lib/utils";

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const;

type MeetingVideoPlayerProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  videoUrl: string;
  meetingId: string;
  displayEntries?: DisplayTranscriptEntry[];
  activeDisplayIndex?: number | null;
  onActiveDisplayIndexChange?: (index: number | null) => void;
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function MeetingVideoPlayer({
  videoRef,
  videoUrl,
  meetingId,
  displayEntries = [],
  activeDisplayIndex = null,
  onActiveDisplayIndexChange,
}: MeetingVideoPlayerProps) {
  const hasTranscript = displayEntries.length > 0;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const segmentPointerRef = useRef(0);
  const speedMenuRef = useRef<HTMLDivElement>(null);

  const sortedEntries = useMemo(
    () => sortDisplayEntriesByTime(displayEntries),
    [displayEntries],
  );

  const syncPointerToIndex = useCallback(
    (index: number | null) => {
      if (index === null) return;
      const pointer = sortedEntries.findIndex(
        (item) => item.displayIndex === index,
      );
      if (pointer >= 0) {
        segmentPointerRef.current = pointer;
      }
    },
    [sortedEntries],
  );

  const updateActiveIndex = useCallback(
    (time: number) => {
      if (!onActiveDisplayIndexChange || !hasTranscript) {
        return;
      }

      const sorted = sortedEntries.map((item) => item.entry);
      const { index, pointer } = findActiveDisplayIndex(
        sorted,
        time,
        segmentPointerRef.current,
      );
      segmentPointerRef.current = pointer;
      const displayIndex =
        index !== null ? sortedEntries[index]?.displayIndex ?? null : null;
      if (displayIndex !== activeDisplayIndex) {
        onActiveDisplayIndexChange(displayIndex);
      }
    },
    [
      activeDisplayIndex,
      hasTranscript,
      onActiveDisplayIndexChange,
      sortedEntries,
    ],
  );

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    updateActiveIndex(video.currentTime);
  }, [videoRef, updateActiveIndex]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
    setVolume(video.volume);
    setIsMuted(video.muted);
    setPlaybackRate(video.playbackRate);
  }, [videoRef]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => {
        // Source may be unavailable or autoplay blocked.
      });
    } else {
      video.pause();
    }
  }, [videoRef]);

  const handleSeek = useCallback(
    (value: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = value;
      setCurrentTime(value);
      updateActiveIndex(value);
    },
    [videoRef, updateActiveIndex],
  );

  const skip = useCallback(
    (delta: number) => {
      const video = videoRef.current;
      if (!video) return;
      const next = Math.min(
        Math.max(0, video.currentTime + delta),
        duration || video.duration || 0,
      );
      handleSeek(next);
    },
    [videoRef, duration, handleSeek],
  );

  const handleVolumeChange = useCallback(
    (value: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.volume = value;
      video.muted = value === 0;
      setVolume(value);
      setIsMuted(value === 0);
    },
    [videoRef],
  );

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, [videoRef]);

  const setSpeed = useCallback(
    (rate: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.playbackRate = rate;
      setPlaybackRate(rate);
      setSpeedMenuOpen(false);
    },
    [videoRef],
  );

  const handleDownload = useCallback(() => {
    setDownloading(true);
    const link = document.createElement("a");
    link.href = `/api/meetings/${meetingId}/video`;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => setDownloading(false), 1500);
  }, [meetingId]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.code !== "Space") return;
      event.preventDefault();
      togglePlay();
    },
    [togglePlay],
  );

  useEffect(() => {
    syncPointerToIndex(activeDisplayIndex);
  }, [activeDisplayIndex, syncPointerToIndex]);

  useEffect(() => {
    if (!speedMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        speedMenuRef.current &&
        !speedMenuRef.current.contains(event.target as Node)
      ) {
        setSpeedMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [speedMenuOpen]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="flex h-full min-h-0 flex-col outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          preload="metadata"
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="block h-full w-full object-contain"
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-800 bg-slate-950 px-3 py-3 sm:px-4">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={(event) => handleSeek(Number(event.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-primary"
          aria-label="Seek"
        />

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => skip(-10)}
            className="inline-flex h-8 shrink-0 items-center gap-0.5 rounded-full px-2 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Skip back 10 seconds"
          >
            <RotateCcw className="size-3.5" />
            10s
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4 translate-x-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => skip(10)}
            className="inline-flex h-8 shrink-0 items-center gap-0.5 rounded-full px-2 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Skip forward 10 seconds"
          >
            10s
            <RotateCw className="size-3.5" />
          </button>

          <span className="shrink-0 text-xs text-slate-400 tabular-nums sm:text-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="ml-auto flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-60"
              aria-label="Download recording"
              title="Download recording"
            >
              {downloading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
            </button>

            <div className="relative" ref={speedMenuRef}>
              <button
                type="button"
                onClick={() => setSpeedMenuOpen((open) => !open)}
                className="inline-flex h-8 shrink-0 items-center rounded-lg bg-white/10 px-2.5 text-xs font-medium text-white transition-colors hover:bg-white/20 sm:px-3"
                aria-label="Playback speed"
                aria-expanded={speedMenuOpen}
              >
                {playbackRate === 1 ? "1x" : `${playbackRate}x`}
              </button>
              {speedMenuOpen ? (
                <div className="absolute bottom-full right-0 z-10 mb-2 min-w-[5rem] overflow-hidden rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-lg">
                  {PLAYBACK_SPEEDS.map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => setSpeed(speed)}
                      className={cn(
                        "block w-full px-3 py-1.5 text-left text-xs text-white transition-colors hover:bg-white/10",
                        playbackRate === speed && "bg-white/10 font-semibold",
                      )}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={toggleMute}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(event) =>
                handleVolumeChange(Number(event.target.value))
              }
              className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-slate-700 accent-primary sm:w-20"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
