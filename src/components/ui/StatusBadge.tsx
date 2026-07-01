import { cn } from "@/lib/utils";

export type StatusBadgeStatus = "active" | "pending" | "inactive" | "error";

type StatusBadgeProps = {
  status: StatusBadgeStatus;
  label?: string;
  className?: string;
};

const statusStyles: Record<StatusBadgeStatus, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  inactive: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const defaultLabels: Record<StatusBadgeStatus, string> = {
  active: "Active",
  pending: "Pending",
  inactive: "Inactive",
  error: "Error",
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status],
        className,
      )}
    >
      {label ?? defaultLabels[status]}
    </span>
  );
}
