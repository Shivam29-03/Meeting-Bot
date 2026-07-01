import { AlertCircle, CheckCircle2, Mic, Video } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";

export function StatsGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
      <StatCard
        label="Total Meetings"
        value="12"
        icon={Video}
        iconClassName="bg-violet-50"
      />
      <StatCard
        label="Completed"
        value="5"
        icon={CheckCircle2}
        iconClassName="bg-emerald-50"
      />
      <StatCard
        label="Recording"
        value="3"
        icon={Mic}
        iconClassName="bg-amber-50"
      />
      <StatCard
        label="Failed"
        value="2"
        icon={AlertCircle}
        iconClassName="bg-red-50"
      />
    </div>
  );
}
