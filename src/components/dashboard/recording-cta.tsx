"use client";

import { Link2 } from "lucide-react";
import { useState } from "react";

import { Button, Input } from "@/components/ui";

export function RecordingCta() {
  const [meetingUrl, setMeetingUrl] = useState("");

  return (
    <section className="rounded-2xl bg-brand-navy p-6 sm:p-8">
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-primary" />
        <span className="text-[11px] font-semibold tracking-[0.16em] text-indigo-300 uppercase">
          AI Integration Live
        </span>
      </div>

      <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
        Bring MeetingBot into your conversation.
      </h2>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={meetingUrl}
            onChange={(event) => setMeetingUrl(event.target.value)}
            placeholder="Paste Zoom, Meet, or Teams URL"
            className="h-12 rounded-xl border-white/10 bg-[#111a2e] pl-11 text-white placeholder:text-slate-500"
          />
        </div>
        <Button
          size="lg"
          className="h-12 rounded-xl bg-primary px-6 text-sm font-semibold hover:bg-primary/90"
        >
          Start Recording
        </Button>
      </div>
    </section>
  );
}
