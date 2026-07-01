import { cn } from "@/lib/utils";
import type { MeetingStatus } from "@/lib/meeting-types";

type MeetingStatusBadgeProps = {
  status: MeetingStatus;
  className?: string;
};

const statusConfig: Record<
  MeetingStatus,
  { label: string; className: string }
> = {
  requested: {
    label: "Requested",
    className: "bg-amber-100 text-amber-800",
  },
  joining: {
    label: "Joining",
    className: "bg-sky-100 text-sky-800",
  },
  recording: {
    label: "Recording",
    className: "bg-violet-100 text-violet-800",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-800",
  },
  failed: {
    label: "Failed",
    className: "bg-red-100 text-red-800",
  },
};

export function MeetingStatusBadge({ status, className }: MeetingStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
