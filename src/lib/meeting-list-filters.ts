import type { Meeting } from "@/lib/meeting-types";

export type DateFilter =
  | "newest"
  | "oldest"
  | "today"
  | "week"
  | "month";

export type DurationSort = "longest" | "shortest";

export type MeetingListFilters = {
  hostedByMe: boolean;
  dateFilter: DateFilter | null;
  durationSort: DurationSort | null;
};

export const defaultMeetingListFilters: MeetingListFilters = {
  hostedByMe: false,
  dateFilter: null,
  durationSort: null,
};

function getMeetingDurationMs(meeting: Meeting) {
  const start = new Date(meeting.createdAt).getTime();
  const isActive =
    meeting.status === "requested" ||
    meeting.status === "joining" ||
    meeting.status === "recording";
  const end = isActive
    ? Date.now()
    : new Date(meeting.updatedAt ?? meeting.createdAt).getTime();
  return Math.max(0, end - start);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isWithinDays(value: string, days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return new Date(value) >= cutoff;
}

export function applyMeetingListFilters(
  meetings: Meeting[],
  filters: MeetingListFilters,
  currentUserId?: string,
) {
  let result = [...meetings];

  if (filters.hostedByMe && currentUserId) {
    result = result.filter((meeting) => meeting.createdBy === currentUserId);
  }

  if (filters.dateFilter === "today") {
    const today = new Date();
    result = result.filter((meeting) => isSameDay(new Date(meeting.createdAt), today));
  } else if (filters.dateFilter === "week") {
    result = result.filter((meeting) => isWithinDays(meeting.createdAt, 7));
  } else if (filters.dateFilter === "month") {
    result = result.filter((meeting) => isWithinDays(meeting.createdAt, 30));
  }

  if (filters.durationSort === "longest") {
    result.sort((a, b) => getMeetingDurationMs(b) - getMeetingDurationMs(a));
  } else if (filters.durationSort === "shortest") {
    result.sort((a, b) => getMeetingDurationMs(a) - getMeetingDurationMs(b));
  } else if (filters.dateFilter === "oldest") {
    result.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  } else {
    result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  return result;
}

export function hasActiveMeetingListFilters(filters: MeetingListFilters) {
  return filters.hostedByMe || !!filters.dateFilter || !!filters.durationSort;
}
