import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { MeetingsPageContent } from "@/components/meetings/meetings-page-content";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { authOptions } from "@/lib/auth";
import { listMeetings } from "@/lib/meeting-store";

export default async function MeetingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <DashboardShell header={<DashboardHeader />}>
      <MeetingsPageContent initialMeetings={listMeetings()} />
    </DashboardShell>
  );
}
