"use client";

import { useEffect } from "react";

import type { Meeting } from "@/lib/meeting-types";
import { getMeetings } from "@/services/meetingService";

const ACTIVE_STATUSES = new Set<Meeting["status"] | "in_call">([
  "requested",
  "joining",
  "recording",
  "in_call",
]);

type UseMeetingsPollingOptions = {
  meetings: Meeting[];
  onUpdate: (meetings: Meeting[]) => void;
  intervalMs?: number;
};

export function useMeetingsPolling({
  meetings,
  onUpdate,
  intervalMs = 10000,
}: UseMeetingsPollingOptions) {
  const hasActiveMeetings = meetings.some((meeting) =>
    ACTIVE_STATUSES.has(meeting.status),
  );

  useEffect(() => {
    if (!hasActiveMeetings) {
      return;
    }

    let cancelled = false;

    const refreshMeetings = async () => {
      try {
        const data = await getMeetings();
        if (!cancelled) {
          onUpdate(data.meetings ?? []);
        }
      } catch (error) {
        console.error("Failed to refresh meetings:", error);
      }
    };

    const intervalId = window.setInterval(() => {
      void refreshMeetings();
    }, intervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [hasActiveMeetings, intervalMs, onUpdate]);
}
