"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type NavbarProps = {
  variant?: "default" | "brand";
  className?: string;
};

export function Navbar({ variant = "default", className }: NavbarProps) {
  const { data: session, status } = useSession();
  const [loggingOut, setLoggingOut] = useState(false);

  const isAuthenticated = status === "authenticated";
  const displayName = session?.user?.name ?? session?.user?.email ?? "User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <nav
      className={cn(
        "flex items-center justify-between px-6 py-4",
        variant === "brand" ? "bg-brand-navy" : "border-b border-border bg-background",
        className,
      )}
    >
      <Link href={isAuthenticated ? "/dashboard" : "/login"}>
        <Logo showTagline={variant === "brand"} />
      </Link>

      {isAuthenticated ? (
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 sm:flex">
            <Avatar size="sm">
              {session?.user?.image ? (
                <AvatarImage src={session.user.image} alt={displayName} />
              ) : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="max-w-[160px] truncate text-sm font-medium text-foreground">
              {displayName}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={loggingOut}
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="size-4" />
            {loggingOut ? "Signing out..." : "Log out"}
          </Button>
        </div>
      ) : null}
    </nav>
  );
}
