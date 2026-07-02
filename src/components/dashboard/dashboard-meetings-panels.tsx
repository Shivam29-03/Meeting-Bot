"use client";

import { useCallback, useState } from "react";

import { RecentMeetings } from "@/components/dashboard/recent-meetings";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { useMeetingsPolling } from "@/hooks/use-meetings-polling";
import type { Meeting } from "@/lib/meeting-types";

type DashboardMeetingsPanelsProps = {
  initialMeetings: Meeting[];
  layout?: "mobile-stats" | "desktop-stats";
};

export function DashboardMeetingsPanels({
  initialMeetings,
  layout = "mobile-stats",
}: DashboardMeetingsPanelsProps) {
  const [meetings, setMeetings] = useState(initialMeetings);

  const handleMeetingsUpdate = useCallback((nextMeetings: Meeting[]) => {
    setMeetings(nextMeetings);
  }, []);

  useMeetingsPolling({
    meetings,
    onUpdate: handleMeetingsUpdate,
  });

  if (layout === "desktop-stats") {
    return <StatsGrid meetings={meetings} />;
  }

  return (
    <>
      <div className="xl:hidden">
        <StatsGrid meetings={meetings} />
      </div>
      <RecentMeetings meetings={meetings} />
    </>
  );
}
