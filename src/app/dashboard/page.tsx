import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { DatabaseErrorBanner } from "@/components/dashboard/database-error-banner";
import { DashboardMeetingsPanels } from "@/components/dashboard/dashboard-meetings-panels";
import { Greeting } from "@/components/dashboard/greeting";
import { RecordingCta } from "@/components/dashboard/recording-cta";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { authOptions } from "@/lib/auth";
import { loadMeetingsForUser } from "@/lib/load-meetings";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const displayName = session.user.name ?? session.user.email ?? "there";
  const userId = session.user.email ?? session.user.id;
  const { meetings, error: dbError } = userId
    ? await loadMeetingsForUser(userId)
    : { meetings: [], error: null };

  return (
    <DashboardShell header={<DashboardHeader />}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <Greeting name={displayName} />

        {dbError ? <DatabaseErrorBanner message={dbError} /> : null}

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-8">
            <RecordingCta />
            <DashboardMeetingsPanels initialMeetings={meetings} />
          </div>

          <div className="hidden xl:block">
            <DashboardMeetingsPanels
              initialMeetings={meetings}
              layout="desktop-stats"
            />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
