import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  showTagline?: boolean;
  compact?: boolean;
  theme?: "dark" | "light";
};

export function Logo({
  className,
  showTagline = true,
  compact = false,
  theme = "dark",
}: LogoProps) {
  const isDark = theme === "dark";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl border",
          isDark
            ? "border-white/10 bg-[#111a2e]"
            : "border-slate-200 bg-slate-100",
        )}
      >
        <div
          className={cn(
            "flex size-7 items-center justify-center rounded-lg",
            isDark ? "bg-[#1a2744]" : "bg-white",
          )}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-5 text-[#38bdf8]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <rect x="5" y="7" width="14" height="11" rx="2" />
            <circle cx="9" cy="11" r="1" fill="currentColor" stroke="none" />
            <circle cx="15" cy="11" r="1" fill="currentColor" stroke="none" />
            <path d="M9 15h6" strokeLinecap="round" />
            <path d="M12 4v3" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {!compact ? (
        <div className="min-w-0">
          <p
            className={cn(
              "truncate text-base font-semibold",
              isDark ? "text-white" : "text-foreground",
            )}
          >
            MeetingBot
          </p>
          {showTagline ? (
            <p
              className={cn(
                "truncate text-[10px] font-medium tracking-[0.18em] uppercase",
                isDark ? "text-slate-400" : "text-muted-foreground",
              )}
            >
              AI Enterprise Partner
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
