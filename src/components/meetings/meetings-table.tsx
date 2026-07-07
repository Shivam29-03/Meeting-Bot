import Link from "next/link";
import {
  CheckCircle2,
  MessageSquare,
  Trash2,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

import { MeetingStatusBadge } from "@/components/meetings/meeting-status-badge";
import { Button } from "@/components/ui";
import { getFailureReasonContent } from "@/lib/meeting-failure";
import type { Meeting, MeetingStatus } from "@/lib/meeting-types";
import { cn } from "@/lib/utils";

type MeetingsTableProps = {
  meetings: Meeting[];
  onDelete: (id: string) => void;
};

const statusIcons: Record<MeetingStatus, { icon: LucideIcon; className: string }> = {
  requested: {
    icon: MessageSquare,
    className: "bg-amber-100 text-amber-600",
  },
  joining: {
    icon: MessageSquare,
    className: "bg-sky-100 text-sky-600",
  },
  recording: {
    icon: Video,
    className: "bg-violet-100 text-violet-600",
  },
  completed: {
    icon: CheckCircle2,
    className: "bg-emerald-100 text-emerald-600",
  },
  failed: {
    icon: Users,
    className: "bg-red-100 text-red-600",
  },
};

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function MeetingsTable({ meetings, onDelete }: MeetingsTableProps) {
  if (meetings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <p className="text-sm font-medium text-slate-900">No meetings found</p>
        <p className="mt-1 text-sm text-slate-500">
          Try a different filter or start a new meeting.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-5 py-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Meeting
              </th>
              <th className="px-5 py-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Created At
              </th>
              <th className="px-5 py-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Status
              </th>
              <th className="px-5 py-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((meeting) => {
              const { icon: Icon, className } = statusIcons[meeting.status];

              return (
                <tr key={meeting.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-lg",
                          className,
                        )}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{meeting.title}</p>
                        {meeting.status === "failed" ? (
                          <p className="mt-0.5 text-xs font-medium text-red-500">
                            {
                              getFailureReasonContent(
                                meeting.failureReason ?? meeting.subCode,
                              ).short
                            }
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {formatCreatedAt(meeting.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <MeetingStatusBadge status={meeting.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/dashboard/meetings/${meeting.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        View
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${meeting.title}`}
                        onClick={() => onDelete(meeting.id)}
                      >
                        <Trash2 className="size-4 text-slate-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
