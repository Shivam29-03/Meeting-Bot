import { MoreVertical, type LucideIcon } from "lucide-react";

import { Button, StatusBadge, type StatusBadgeStatus } from "@/components/ui";
import { cn } from "@/lib/utils";

export type MeetingStatus = "recording" | "summary" | "transcribing";

type MeetingListItemProps = {
  title: string;
  subtitle: string;
  status: MeetingStatus;
  icon: LucideIcon;
  iconClassName: string;
  isLive?: boolean;
};

const statusLabels: Record<MeetingStatus, string> = {
  recording: "Recording",
  summary: "Summary Ready",
  transcribing: "Transcribing",
};

const statusBadgeMap: Record<MeetingStatus, StatusBadgeStatus> = {
  recording: "active",
  summary: "active",
  transcribing: "pending",
};

export function MeetingListItem({
  title,
  subtitle,
  status,
  icon: Icon,
  iconClassName,
  isLive = false,
}: MeetingListItemProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          iconClassName,
        )}
      >
        <Icon className="size-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{title}</p>
          <StatusBadge
            status={statusBadgeMap[status]}
            label={statusLabels[status]}
          />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="flex shrink-0 items-center">
        {isLive ? (
          <div className="flex items-center gap-2 text-xs font-semibold text-red-500">
            <span className="size-2 rounded-full bg-red-500" />
            LIVE
          </div>
        ) : (
          <Button variant="ghost" size="icon-sm" aria-label="More options">
            <MoreVertical className="size-4 text-slate-500" />
          </Button>
        )}
      </div>
    </div>
  );
}
