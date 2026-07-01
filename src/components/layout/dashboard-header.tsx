"use client";

import Link from "next/link";
import { Bell, History, Search } from "lucide-react";
import { useSession } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input, buttonVariants } from "@/components/ui";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const { data: session } = useSession();
  const displayName = session?.user?.name ?? session?.user?.email ?? "User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const iconLinkClass = cn(
    buttonVariants({ variant: "ghost", size: "icon" }),
    "rounded-full",
  );

  return (
    <header className="border-b border-border bg-background px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-2xl">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search meetings, transcripts, or insights..."
            className="h-11 rounded-full border-slate-200 bg-white pl-11 shadow-sm"
          />
        </div>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <Link
            href="/dashboard/settings"
            className={iconLinkClass}
            aria-label="Notifications"
          >
            <Bell className="size-5 text-slate-600" />
          </Link>
          <Link
            href="/dashboard/meetings"
            className={iconLinkClass}
            aria-label="History"
          >
            <History className="size-5 text-slate-600" />
          </Link>

          <div className="ml-1 flex items-center gap-3 border-l border-border pl-3">
            <Avatar size="sm">
              {session?.user?.image ? (
                <AvatarImage src={session.user.image} alt={displayName} />
              ) : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-semibold text-foreground sm:inline">
              {displayName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
