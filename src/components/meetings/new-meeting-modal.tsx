"use client";

import { Link2, X } from "lucide-react";

import { Button, Input } from "@/components/ui";

type NewMeetingModalProps = {
  open: boolean;
  meetUrl: string;
  loading: boolean;
  onClose: () => void;
  onMeetUrlChange: (value: string) => void;
  onSubmit: () => void;
};

export function NewMeetingModal({
  open,
  meetUrl,
  loading,
  onClose,
  onMeetUrlChange,
  onSubmit,
}: NewMeetingModalProps) {
  if (!open) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">New Meeting</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Paste a Google Meet, Zoom, or Teams link to start recording.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="new-meet-url"
              className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
              Meeting URL
            </label>
            <div className="relative">
              <Link2 className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="new-meet-url"
                type="url"
                value={meetUrl}
                onChange={(event) => onMeetUrlChange(event.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij"
                className="h-11 rounded-xl border-slate-200 bg-slate-50 pr-10"
                required
                autoFocus
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !meetUrl.trim()}
            className="h-11 w-full rounded-xl text-sm font-semibold"
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
      </div>
    </div>
  );
}
