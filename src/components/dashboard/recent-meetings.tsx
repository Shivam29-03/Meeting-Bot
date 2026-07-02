import Link from "next/link";
import { Video } from "lucide-react";

import { MeetingStatusBadge } from "@/components/meetings/meeting-status-badge";
import type { Meeting } from "@/lib/meeting-types";

type RecentMeetingsProps = {
  meetings: Meeting[];
};

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function RecentMeetings({ meetings = [] }: RecentMeetingsProps) {
  const recentMeetings = meetings.slice(0, 3);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Recent Meetings</h2>
        <Link
          href="/dashboard/meetings"
          className="text-sm font-medium text-primary hover:text-primary/80"
        >
          View all history
        </Link>
      </div>

      {recentMeetings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-900">No meetings yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Start a recording to see your meetings here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recentMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Video className="size-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {meeting.title}
                  </p>
                  <MeetingStatusBadge status={meeting.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatCreatedAt(meeting.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
