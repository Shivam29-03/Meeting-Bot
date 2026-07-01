import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { ProfilePageContent } from "@/components/profile/profile-page-content";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { authOptions } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <DashboardShell header={<DashboardHeader />}>
      <ProfilePageContent />
    </DashboardShell>
  );
}
