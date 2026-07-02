import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { MeetingsPageContent } from "@/components/meetings/meetings-page-content";
import { DatabaseErrorBanner } from "@/components/dashboard/database-error-banner";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { authOptions } from "@/lib/auth";
import { loadMeetingsForUser } from "@/lib/load-meetings";

export default async function MeetingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.email ?? session.user.id;
  const { meetings, error: dbError } = userId
    ? await loadMeetingsForUser(userId)
    : { meetings: [], error: null };

  return (
    <DashboardShell header={<DashboardHeader />}>
      {dbError ? (
        <div className="mx-auto w-full max-w-7xl px-4 pb-4">
          <DatabaseErrorBanner message={dbError} />
        </div>
      ) : null}
      <MeetingsPageContent initialMeetings={meetings} />
    </DashboardShell>
  );
}
