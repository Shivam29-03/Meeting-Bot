import { type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  footer?: React.ReactNode;
  icon?: LucideIcon;
  iconClassName?: string;
};

export function StatCard({
  label,
  value,
  footer,
  icon: Icon,
  iconClassName,
}: StatCardProps) {
  return (
    <Card className="border-slate-200 shadow-sm ring-0">
      <CardContent className="flex min-h-[132px] flex-col justify-between py-5">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <p className="text-4xl font-bold tracking-tight text-foreground">{value}</p>
          {footer ? <div className="pb-1">{footer}</div> : null}
          {Icon ? (
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-lg",
                iconClassName ?? "bg-indigo-50",
              )}
            >
              <Icon className="size-4 text-primary" />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
