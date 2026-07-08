import Image from "next/image";

import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  compact?: boolean;
  theme?: "dark" | "light";
};

export function Logo({
  className,
  compact = false,
  theme = "dark",
}: LogoProps) {
  const isDark = theme === "dark";

  return (
    <div className={cn("w-40", className)}>
      <Image
        src="/Logo.svg"
        alt="MetaWurks"
        width={160}
        height={47}
        priority
        className="h-auto w-full"
      />

      {!compact ? (
        <p
          className={cn(
            "mt-1 pl-[31%] text-sm font-semibold tracking-wide",
            isDark ? "text-white" : "text-foreground",
          )}
        >
          MeetingBot
        </p>
      ) : null}
    </div>
  );
}
