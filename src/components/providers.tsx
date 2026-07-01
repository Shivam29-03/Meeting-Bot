"use client";

import { SessionProvider } from "next-auth/react";

import { SessionCleanup } from "@/components/auth/session-cleanup";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionCleanup />
      {children}
    </SessionProvider>
  );
}
