import { AlertCircle, CheckCircle2, X } from "lucide-react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

type MeetingToastProps = {
  type: "success" | "error";
  title: string;
  message?: string;
  onClose: () => void;
  className?: string;
};

export function MeetingToast({
  type,
  title,
  message,
  onClose,
  className,
}: MeetingToastProps) {
  const isSuccess = type === "success";

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 shadow-sm",
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-red-200 bg-red-50 text-red-900",
        className,
      )}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
      ) : (
        <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        {message ? <p className="mt-0.5 text-sm opacity-90">{message}</p> : null}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onClose}
        className={cn(
          "shrink-0",
          isSuccess
            ? "text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900"
            : "text-red-700 hover:bg-red-100 hover:text-red-900",
        )}
        aria-label="Dismiss notification"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
