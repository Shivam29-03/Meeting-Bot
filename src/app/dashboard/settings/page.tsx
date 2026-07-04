import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SettingsPageContent } from "@/components/settings/settings-page-content";
import { authOptions } from "@/lib/auth";
import { getUserSettings } from "@/lib/user-settings";
import { defaultUserSettings } from "@/lib/user-settings-types";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.email ?? session.user.id;
  if (!userId) {
    redirect("/login");
  }

  let initialSettings = defaultUserSettings;

  try {
    initialSettings = await getUserSettings(userId);
  } catch (error) {
    console.error("Failed to load settings for settings page:", error);
  }

  return (
    <DashboardShell header={<DashboardHeader />}>
      <SettingsPageContent initialSettings={initialSettings} />
    </DashboardShell>
  );
}
