"use client";

import { Link2 } from "lucide-react";
import { useEffect, useState } from "react";

import { MeetingToast } from "@/components/meetings/meeting-toast";
import { Button, Input } from "@/components/ui";
import { getApiErrorMessage } from "@/lib/axios";
import { createMeeting } from "@/services/meetingService";

type ToastState = {
  type: "success" | "error";
  title: string;
  message?: string;
} | null;

export function RecordingCta() {
  const [meetingUrl, setMeetingUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleStartRecording = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedUrl = meetingUrl.trim();
    if (!trimmedUrl) return;

    setLoading(true);
    setToast(null);

    try {
      await createMeeting({ meetUrl: trimmedUrl });
      setMeetingUrl("");
      setToast({
        type: "success",
        title: "Meeting recording started successfully!",
        message: "Your bot will join the meeting shortly.",
      });
    } catch (error) {
      setToast({
        type: "error",
        title: "Failed to start recording",
        message: getApiErrorMessage(
          error,
          "Please check the meeting link and try again.",
        ),
      });
    } finally {
      setLoading(false);
    }
  };

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

      {toast ? (
        <div className="mt-4">
          <MeetingToast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      ) : null}

      <form
        onSubmit={handleStartRecording}
        className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="url"
            value={meetingUrl}
            onChange={(event) => setMeetingUrl(event.target.value)}
            placeholder="Paste Zoom, Meet, or Teams URL"
            className="h-12 rounded-xl border-white/10 bg-[#111a2e] pl-11 text-white placeholder:text-slate-500"
            required
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={loading || !meetingUrl.trim()}
          className="h-12 rounded-xl bg-primary px-6 text-sm font-semibold hover:bg-primary/90"
        >
          {loading ? (
            <>
              <span className="mr-2 size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Starting...
            </>
          ) : (
            "Start Recording"
          )}
        </Button>
      </form>
    </section>
  );
}
