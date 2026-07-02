import { Clock } from "lucide-react";

import { MeetingStatusBadge } from "@/components/meetings/meeting-status-badge";
import { Card } from "@/components/ui";
import type { Meeting } from "@/lib/meeting-types";

type FeaturedMeetingCardProps = {
  meeting: Meeting;
};

function formatStartedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function FeaturedMeetingCard({ meeting }: FeaturedMeetingCardProps) {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm ring-0">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex min-h-[120px] flex-1 flex-col justify-center rounded-xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-5 sm:max-w-[220px]">
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wide text-white uppercase">
            <span className="size-1.5 animate-pulse rounded-full bg-red-400" />
            Live
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
              Currently In Progress
            </p>
            <h3 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
              {meeting.title}
            </h3>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                Started {formatStartedAt(meeting.createdAt)}
              </span>
            </div>
            <div className="mt-3">
              <MeetingStatusBadge status={meeting.status} />
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto">
            <a
              href={meeting.meetUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Join Call
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
}
