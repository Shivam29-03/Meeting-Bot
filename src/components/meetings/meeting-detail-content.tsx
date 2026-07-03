"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  Link2,
  Play,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";

import { MeetingStatusBadge } from "@/components/meetings/meeting-status-badge";
import { Button, Card, CardContent } from "@/components/ui";
import type { Meeting } from "@/lib/meeting-types";
import { getMeetingById, deleteMeeting } from "@/services/meetingService";
import { cn } from "@/lib/utils";

type MeetingDetailContentProps = {
  initialMeeting: Meeting;
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

function formatDuration(startedAt: string) {
  const elapsedMs = Date.now() - new Date(startedAt).getTime();
  const totalMinutes = Math.max(1, Math.floor(elapsedMs / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
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

export function MeetingDetailContent({ initialMeeting }: MeetingDetailContentProps) {
  const router = useRouter();
  const [meeting, setMeeting] = useState(initialMeeting);
  const [activeTab, setActiveTab] = useState<DetailTab>("transcript");
  const [deleting, setDeleting] = useState(false);

  const isActive = ACTIVE_STATUSES.has(meeting.status);
  const isCompleted = meeting.status === "completed";
  const isFailed = meeting.status === "failed";

  const refreshMeeting = useCallback(async () => {
    try {
      const data = await getMeetingById(meeting.id);
      if (data.meeting) {
        setMeeting(data.meeting);
      }
    } catch (error) {
      console.error("Failed to refresh meeting:", error);
    }
  }, [meeting.id]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refreshMeeting();
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [isActive, refreshMeeting]);

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
            <Button variant="outline" className="h-10 rounded-xl px-4" disabled={!isCompleted}>
              <Download className="size-4" />
              Export
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
          <Card className="overflow-hidden border-slate-200 shadow-sm ring-0">
            <div className="relative aspect-video bg-gradient-to-br from-slate-800 via-slate-900 to-brand-navy">
              {isActive ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide uppercase">
                    <span className="size-2 animate-pulse rounded-full bg-red-400" />
                    {meeting.status === "recording" ? "Recording in progress" : "Bot joining meeting"}
                  </span>
                  <p className="max-w-sm text-center text-sm text-slate-300">
                    Video will be available here once the meeting ends and processing completes.
                  </p>
                </div>
              ) : isFailed ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-white">
                  <p className="text-sm font-semibold">Recording unavailable</p>
                  <p className="max-w-sm text-sm text-slate-300">
                    The bot could not complete this meeting. Try starting a new recording.
                  </p>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
                  <div className="flex size-16 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                    <Play className="size-7 fill-white text-white" />
                  </div>
                  <p className="text-sm font-medium">Recording ready</p>
                  <p className="max-w-sm text-center text-sm text-slate-300">
                    Video playback will be enabled when storage is connected.
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card className="border-slate-200 shadow-sm ring-0">
            <CardContent className="p-0">
              <div className="flex border-b border-slate-200">
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

              <div className="p-5 sm:p-6">
                {activeTab === "transcript" ? (
                  <TranscriptPanel meeting={meeting} />
                ) : (
                  <SummaryPanel meeting={meeting} />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="flex flex-col gap-4">
          <Card className="border-slate-200 shadow-sm ring-0">
            <CardContent className="py-5">
              <h2 className="text-sm font-semibold text-foreground">Meeting details</h2>
              <dl className="mt-4 space-y-4 text-sm">
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
                      {isActive ? `${formatDuration(meeting.createdAt)} so far` : "—"}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-muted-foreground">Participants</dt>
                    <dd className="font-medium text-foreground">—</dd>
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
                  className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Join Call
                </a>
              ) : null}
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

function TranscriptPanel({ meeting }: { meeting: Meeting }) {
  if (meeting.status === "completed") {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
        <p className="text-sm font-medium text-slate-900">Transcript processing</p>
        <p className="mt-1 text-sm text-slate-500">
          Your transcript will appear here once Recall finishes processing the recording.
        </p>
      </div>
    );
  }

  if (meeting.status === "failed") {
    return (
      <div className="rounded-xl border border-dashed border-red-200 bg-red-50 px-6 py-12 text-center">
        <p className="text-sm font-medium text-red-900">Transcript unavailable</p>
        <p className="mt-1 text-sm text-red-700">
          This meeting did not complete successfully, so no transcript was generated.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="size-2 animate-pulse rounded-full bg-violet-500" />
        Live transcription in progress...
      </div>
      <div className="space-y-3">
        <TranscriptLine speaker="Speaker 1" time="00:00" text="Waiting for transcript segments..." muted />
      </div>
    </div>
  );
}

function SummaryPanel({ meeting }: { meeting: Meeting }) {
  if (meeting.status !== "completed") {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
        <p className="text-sm font-medium text-slate-900">Summary not ready</p>
        <p className="mt-1 text-sm text-slate-500">
          AI summary will be generated after the meeting ends and the transcript is processed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold tracking-wide text-primary uppercase">
          Key takeaways
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          AI-generated summary will appear here once the summary feature is connected.
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Action items
        </p>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>—</li>
        </ul>
      </div>
    </div>
  );
}

function TranscriptLine({
  speaker,
  time,
  text,
  muted = false,
}: {
  speaker: string;
  time: string;
  text: string;
  muted?: boolean;
}) {
  return (
    <div className={cn("rounded-xl border border-slate-200 p-4", muted && "opacity-70")}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">{speaker}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
    </div>
  );
}
