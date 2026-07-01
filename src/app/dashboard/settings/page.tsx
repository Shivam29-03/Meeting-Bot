import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SettingsPageContent } from "@/components/settings/settings-page-content";
import { authOptions } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <DashboardShell header={<DashboardHeader />}>
      <SettingsPageContent />
    </DashboardShell>
  );
}
