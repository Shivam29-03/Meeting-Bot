import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { buttonVariants } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function MeetingNotFound() {
  return (
    <DashboardShell header={<DashboardHeader />}>
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground">Meeting not found</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          This meeting may have been deleted or you do not have permission to view it.
        </p>
        <Link
          href="/dashboard/meetings"
          className={cn(buttonVariants(), "h-10 rounded-xl px-5")}
        >
          <ArrowLeft className="size-4" />
          Back to Meetings
        </Link>
      </div>
    </DashboardShell>
  );
}
