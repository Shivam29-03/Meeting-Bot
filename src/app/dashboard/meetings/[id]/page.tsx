import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { DatabaseErrorBanner } from "@/components/dashboard/database-error-banner";
import { MeetingDetailContent } from "@/components/meetings/meeting-detail-content";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { authOptions } from "@/lib/auth";
import { loadMeetingForUser } from "@/lib/load-meetings";

type MeetingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MeetingDetailPage({ params }: MeetingDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.email ?? session.user.id;
  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;
  const { meeting, error: dbError } = await loadMeetingForUser(id, userId);

  if (dbError) {
    return (
      <DashboardShell header={<DashboardHeader />}>
        <div className="mx-auto w-full max-w-7xl">
          <DatabaseErrorBanner message={dbError} />
        </div>
      </DashboardShell>
    );
  }

  if (!meeting) {
    notFound();
  }

  return (
    <DashboardShell header={<DashboardHeader />}>
      <MeetingDetailContent initialMeeting={meeting} />
    </DashboardShell>
  );
}
