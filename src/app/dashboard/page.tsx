import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { Greeting } from "@/components/dashboard/greeting";
import { RecentMeetings } from "@/components/dashboard/recent-meetings";
import { RecordingCta } from "@/components/dashboard/recording-cta";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const displayName = session.user.name ?? session.user.email ?? "there";

  return (
    <DashboardShell header={<DashboardHeader />}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <Greeting name={displayName} />

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-8">
            <RecordingCta />
            <div className="xl:hidden">
              <StatsGrid />
            </div>
            <RecentMeetings />
          </div>

          <div className="hidden xl:block">
            <StatsGrid />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
