import { AlertCircle, CheckCircle2, Mic, Video } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import type { Meeting, MeetingStatus } from "@/lib/meeting-types";

type StatsGridProps = {
  meetings: Meeting[];
};

function countStatus(meetings: Meeting[], status: MeetingStatus) {
  return meetings.filter((meeting) => meeting.status === status).length;
}

export function StatsGrid({ meetings = [] }: StatsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
      <StatCard
        label="Total Meetings"
        value={String(meetings.length)}
        icon={Video}
        iconClassName="bg-violet-50"
      />
      <StatCard
        label="Completed"
        value={String(countStatus(meetings, "completed"))}
        icon={CheckCircle2}
        iconClassName="bg-emerald-50"
      />
      <StatCard
        label="Recording"
        value={String(countStatus(meetings, "recording"))}
        icon={Mic}
        iconClassName="bg-amber-50"
      />
      <StatCard
        label="Failed"
        value={String(countStatus(meetings, "failed"))}
        icon={AlertCircle}
        iconClassName="bg-red-50"
      />
    </div>
  );
}
