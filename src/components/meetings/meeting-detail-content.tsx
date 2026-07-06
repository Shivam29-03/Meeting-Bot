"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  Link2,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";

import { MeetingStatusBadge } from "@/components/meetings/meeting-status-badge";
import { MeetingTranscriptPanel } from "@/components/meetings/meeting-transcript-panel";
import { Button, Card, CardContent } from "@/components/ui";
import type { Meeting, TranscriptSegment } from "@/lib/meeting-types";
import {
  downloadMeetingExport,
  downloadTranscriptFile,
} from "@/lib/meeting-export";
import { deleteMeeting, getMeetingById } from "@/services/meetingService";
import { cn } from "@/lib/utils";

type MeetingDetailContentProps = {
  initialMeeting: Meeting;
  initialVideoUrl?: string | null;
  initialTranscriptSegments?: TranscriptSegment[];
  initialDurationSeconds?: number | null;
  initialParticipants?: string[];
};

type DetailTab = "transcript" | "summary";

const ACTIVE_STATUSES = new Set<Meeting["status"]>(["requested", "joining", "recording"]);

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDurationFromSeconds(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
}

function platformLabel(url: string) {
  try {
    const hostname = new URL(url).hostname;
    if (hostname.includes("meet.google")) return "Google Meet";
    if (hostname.includes("zoom")) return "Zoom";
    if (hostname.includes("teams")) return "Microsoft Teams";
  } catch {
    // fall through
  }

  return "Video conference";
}

function formatDurationLabel(
  meeting: Meeting,
  durationSeconds: number | null,
  isActive: boolean,
) {
  if (durationSeconds === null) {
    return "Not available";
  }

  if (isActive) {
    return `${formatDurationFromSeconds(durationSeconds)} so far`;
  }

  return formatDurationFromSeconds(durationSeconds);
}

function formatParticipantsLabel(participants: string[], isActive: boolean) {
  if (participants.length > 0) {
    return participants.join(", ");
  }

  return isActive ? "Detecting participants..." : "None detected";
}

function failedMeetingMessage(subCode?: string | null) {
  switch (subCode) {
    case "google_meet_bot_blocked":
      return "The bot was blocked from joining this Google Meet.";
    case "google_meet.login_required":
    case "google_meet_login_not_available":
      return "This meeting requires a signed-in Google account, so the bot couldn't join.";
    case "recording_permission_denied":
      return "The host declined the recording request.";
    default:
      return "The bot couldn't record this meeting. Please try again.";
  }
}

export function MeetingDetailContent({
  initialMeeting,
  initialVideoUrl = null,
  initialTranscriptSegments = [],
  initialDurationSeconds = null,
  initialParticipants = [],
}: MeetingDetailContentProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [meeting, setMeeting] = useState(initialMeeting);
  const [videoUrl, setVideoUrl] = useState<string | null>(initialVideoUrl);
  const [transcriptSegments, setTranscriptSegments] =
    useState<TranscriptSegment[]>(initialTranscriptSegments);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(initialDurationSeconds);
  const [participants, setParticipants] = useState<string[]>(initialParticipants);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("transcript");
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const isActive = ACTIVE_STATUSES.has(meeting.status);
  const isCompleted = meeting.status === "completed";
  const isFailed = meeting.status === "failed";
  const shouldPollForAssets =
    isActive ||
    (isCompleted &&
      (!videoUrl || transcriptSegments.length === 0 || participants.length === 0));

  const refreshMeeting = useCallback(async () => {
    try {
      const data = await getMeetingById(meeting.id);
      if (data.meeting) {
        setMeeting(data.meeting);
      }
      setVideoUrl(data.videoUrl ?? null);
      setTranscriptSegments(data.transcriptSegments ?? []);
      setDurationSeconds(data.durationSeconds ?? null);
      setParticipants(data.participants ?? []);
    } catch (error) {
      console.error("Failed to refresh meeting:", error);
    }
  }, [meeting.id]);

  const seekToSegment = useCallback((segment: TranscriptSegment, index: number) => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.currentTime = segment.start;
    setActiveSegmentIndex(index);
    void video.play().catch(() => {
      // Autoplay may be blocked until the user interacts with the page.
    });
  }, []);

  const handleVideoTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || transcriptSegments.length === 0) {
      return;
    }

    const currentTime = video.currentTime;
    const nextIndex = transcriptSegments.findIndex(
      (segment) => currentTime >= segment.start && currentTime < segment.end,
    );

    setActiveSegmentIndex(nextIndex >= 0 ? nextIndex : null);
  }, [transcriptSegments]);

  useEffect(() => {
    if (!shouldPollForAssets) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refreshMeeting();
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [shouldPollForAssets, refreshMeeting]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteMeeting(meeting.id);
      router.push("/dashboard/meetings");
      router.refresh();
    } catch (error) {
      console.error("Failed to delete meeting:", error);
      setDeleting(false);
    }
  };

  const handleDownloadTranscript = useCallback(() => {
    downloadTranscriptFile(meeting.title, transcriptSegments);
  }, [meeting.title, transcriptSegments]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      await downloadMeetingExport({
        meetingId: meeting.id,
        meetingTitle: meeting.title,
        segments: transcriptSegments,
        hasVideo: Boolean(videoUrl),
      });
    } catch (error) {
      console.error("Failed to export meeting:", error);
    } finally {
      setExporting(false);
    }
  }, [meeting.id, meeting.title, transcriptSegments, videoUrl]);

  const canDownloadTranscript = transcriptSegments.length > 0;
  const canExport = canDownloadTranscript || Boolean(videoUrl);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/meetings"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Meetings
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {meeting.title}
              </h1>
              <MeetingStatusBadge status={meeting.status} />
              {meeting.status === "recording" ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
                  <span className="size-2 animate-pulse rounded-full bg-red-500" />
                  LIVE
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatDateTime(meeting.createdAt)} · {platformLabel(meeting.meetUrl)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="h-10 rounded-xl px-4"
              disabled={!canExport || exporting}
              onClick={() => void handleExport()}
            >
              <Download className="size-4" />
              {exporting ? "Exporting..." : "Export"}
            </Button>
            <Button
              variant="outline"
              className="h-10 rounded-xl px-4 text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="size-4" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-6">
          <Card className="gap-0 overflow-hidden border-slate-200 p-0 shadow-sm ring-0">
            <div className="relative aspect-video overflow-hidden bg-black">
              {videoUrl ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  preload="metadata"
                  onTimeUpdate={handleVideoTimeUpdate}
                  className="block h-full w-full object-cover"
                />
              ) : isActive ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-800 via-slate-900 to-brand-navy text-white">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide uppercase">
                    <span className="size-2 animate-pulse rounded-full bg-red-400" />
                    {meeting.status === "recording" ? "Recording in progress" : "Bot joining meeting"}
                  </span>
                  <p className="max-w-sm text-center text-sm text-slate-300">
                    Video will be available here once the meeting ends and processing completes.
                  </p>
                </div>
              ) : isFailed ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-800 via-slate-900 to-brand-navy px-6 text-center text-white">
                  <p className="text-sm font-semibold">Recording unavailable</p>
                  <p className="max-w-sm text-sm text-slate-300">
                    {failedMeetingMessage(meeting.subCode)}
                  </p>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-800 via-slate-900 to-brand-navy px-6 text-center text-white">
                  <p className="text-sm font-semibold">Video not available</p>
                  <p className="max-w-sm text-sm text-slate-300">
                    The recording is still processing or was not saved for this meeting.
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card className="border-slate-200 shadow-sm ring-0">
            <CardContent className="py-5">
              <h2 className="text-sm font-semibold text-foreground">Meeting details</h2>
              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-muted-foreground">Date</dt>
                    <dd className="font-medium text-foreground">
                      {formatDateTime(meeting.createdAt)}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-muted-foreground">Duration</dt>
                    <dd className="font-medium text-foreground">
                      {formatDurationLabel(meeting, durationSeconds, isActive)}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-muted-foreground">Participants</dt>
                    <dd className="font-medium text-foreground">
                      {formatParticipantsLabel(participants, isActive)}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Link2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <dt className="text-muted-foreground">Meeting link</dt>
                    <dd className="truncate font-medium text-primary">
                      <a href={meeting.meetUrl} target="_blank" rel="noreferrer">
                        {meeting.meetUrl}
                      </a>
                    </dd>
                  </div>
                </div>
              </dl>

              {isActive ? (
                <a
                  href={meeting.meetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 sm:w-auto sm:px-8"
                >
                  Join Call
                </a>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <aside className="flex flex-col gap-4">
          <Card className="sticky top-6 flex max-h-[calc(100vh-6rem)] flex-col overflow-hidden border-slate-200 shadow-sm ring-0">
            <CardContent className="flex min-h-0 flex-1 flex-col p-0">
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200">
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => setActiveTab("transcript")}
                    className={cn(
                      "px-5 py-3 text-sm font-semibold transition-colors",
                      activeTab === "transcript"
                        ? "border-b-2 border-primary text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Transcript
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("summary")}
                    className={cn(
                      "px-5 py-3 text-sm font-semibold transition-colors",
                      activeTab === "summary"
                        ? "border-b-2 border-primary text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    AI Summary
                  </button>
                </div>
                {activeTab === "transcript" && canDownloadTranscript ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mr-3 shrink-0 gap-2 text-primary hover:text-primary"
                    onClick={handleDownloadTranscript}
                  >
                    <Download className="size-4" />
                  
                  </Button>
                ) : null}
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {activeTab === "transcript" ? (
                  <MeetingTranscriptPanel
                    meeting={meeting}
                    segments={transcriptSegments}
                    activeSegmentIndex={activeSegmentIndex}
                    hasVideo={Boolean(videoUrl)}
                    onSeek={seekToSegment}
                    fillHeight
                  />
                ) : (
                  <div className="overflow-y-auto p-5 sm:p-6">
                    <SummaryPanel meeting={meeting} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-gradient-to-br from-primary/5 to-indigo-50 shadow-sm ring-0">
            <CardContent className="py-5">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="size-4" />
                <h2 className="text-sm font-semibold">AI insights</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {isCompleted
                  ? "Summary and action items will appear here once AI processing is enabled."
                  : isActive
                    ? "Insights will be generated after the meeting ends."
                    : "No insights available for this meeting."}
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function SummaryPanel({ meeting }: { meeting: Meeting }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
      <p className="text-sm font-medium text-slate-900">Summary not ready</p>
      <p className="mt-1 text-sm text-slate-500">
        {meeting.status === "completed"
          ? "AI summary will appear here once the summary feature is connected."
          : meeting.status === "failed"
            ? "No summary is available for meetings that did not complete successfully."
            : "AI summary will be generated after the meeting ends and the transcript is processed."}
      </p>
    </div>
  );
}
