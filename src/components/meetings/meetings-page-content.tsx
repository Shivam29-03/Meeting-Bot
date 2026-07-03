"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";

import { FeaturedMeetingCard } from "@/components/meetings/featured-meeting-card";
import {
  MeetingFilters,
  type MeetingFilterTab,
} from "@/components/meetings/meeting-filters";
import { MeetingToast } from "@/components/meetings/meeting-toast";
import { MeetingsTable } from "@/components/meetings/meetings-table";
import { MeetingsUpcomingSidebar } from "@/components/meetings/meetings-upcoming-sidebar";
import { NewMeetingModal } from "@/components/meetings/new-meeting-modal";
import { Button } from "@/components/ui";
import { useMeetingsPolling } from "@/hooks/use-meetings-polling";
import type { Meeting } from "@/lib/meeting-types";
import {
  applyMeetingListFilters,
  defaultMeetingListFilters,
  type MeetingListFilters,
} from "@/lib/meeting-list-filters";
import { getApiErrorMessage } from "@/lib/axios";
import { createMeeting, deleteMeeting, getMeetings } from "@/services/meetingService";

type ToastState = {
  type: "success" | "error";
  title: string;
  message?: string;
} | null;

type MeetingsPageContentProps = {
  initialMeetings: Meeting[];
};

export function MeetingsPageContent({ initialMeetings }: MeetingsPageContentProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.email ?? session?.user?.id;

  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [activeTab, setActiveTab] = useState<MeetingFilterTab>("all");
  const [listFilters, setListFilters] = useState<MeetingListFilters>(
    defaultMeetingListFilters,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [meetUrl, setMeetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const handleMeetingsUpdate = useCallback((nextMeetings: Meeting[]) => {
    setMeetings(nextMeetings);
  }, []);

  useMeetingsPolling({
    meetings,
    onUpdate: handleMeetingsUpdate,
  });

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredMeetings = useMemo(() => {
    let result = meetings;

    if (activeTab === "completed") {
      result = result.filter((meeting) => meeting.status === "completed");
    }

    return applyMeetingListFilters(result, listFilters, currentUserId);
  }, [meetings, activeTab, listFilters, currentUserId]);

  const activeMeeting = useMemo(
    () =>
      meetings.find(
        (meeting) => meeting.status === "joining" || meeting.status === "recording",
      ) ?? null,
    [meetings],
  );

  const handleStartRecording = async () => {
    const trimmedUrl = meetUrl.trim();
    if (!trimmedUrl) return;

    setLoading(true);
    setToast(null);

    try {
      const data = await createMeeting({ meetUrl: trimmedUrl });
      if (data.meeting) {
        setMeetings((current) => [data.meeting, ...current]);
      } else {
        const refreshed = await getMeetings();
        setMeetings(refreshed.meetings ?? []);
      }
      setMeetUrl("");
      setModalOpen(false);
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

  const handleDelete = async (id: string) => {
    try {
      await deleteMeeting(id);
      setMeetings((current) => current.filter((meeting) => meeting.id !== id));
    } catch {
      setToast({
        type: "error",
        title: "Failed to delete meeting",
        message: "Please try again.",
      });
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Your Meetings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review recordings, schedule new sessions, and manage your calendar.
          </p>
        </div>
        <Button
          className="h-10 shrink-0 gap-2 rounded-xl px-5 text-sm font-semibold"
          onClick={() => setModalOpen(true)}
        >
          <Plus className="size-4" />
          New Meeting
        </Button>
      </div>

      <MeetingFilters
        activeTab={activeTab}
        filters={listFilters}
        onTabChange={setActiveTab}
        onFiltersChange={setListFilters}
      />

      {toast ? (
        <MeetingToast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      ) : null}

      {activeMeeting ? <FeaturedMeetingCard meeting={activeMeeting} /> : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Activity</h2>
          <MeetingsTable meetings={filteredMeetings} onDelete={handleDelete} />
        </section>

        <div className="xl:sticky xl:top-24 xl:self-start">
          <MeetingsUpcomingSidebar />
        </div>
      </div>

      <NewMeetingModal
        open={modalOpen}
        meetUrl={meetUrl}
        loading={loading}
        onClose={() => setModalOpen(false)}
        onMeetUrlChange={setMeetUrl}
        onSubmit={handleStartRecording}
      />
    </div>
  );
}
