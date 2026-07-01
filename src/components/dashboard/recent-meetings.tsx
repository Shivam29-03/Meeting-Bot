import Link from "next/link";
import { Lightbulb, Users, Video } from "lucide-react";

import {
  MeetingListItem,
  type MeetingStatus,
} from "@/components/dashboard/meeting-list-item";

type Meeting = {
  title: string;
  subtitle: string;
  status: MeetingStatus;
  iconClassName: string;
  isLive?: boolean;
};

const meetings: Meeting[] = [
  {
    title: "Q4 Product Roadmap sync",
    subtitle: "Started 12 mins ago • 8 participants",
    status: "recording",
    iconClassName: "bg-indigo-100 text-indigo-600",
    isLive: true,
  },
  {
    title: "Engineering Weekly standup",
    subtitle: "Yesterday at 10:00 AM • 45m 12s",
    status: "summary",
    iconClassName: "bg-teal-100 text-teal-600",
  },
  {
    title: "Client Onboarding: Acme Corp",
    subtitle: "Oct 24 at 2:30 PM • 1h 05m",
    status: "transcribing",
    iconClassName: "bg-amber-100 text-amber-600",
  },
];

const icons = [Video, Users, Lightbulb] as const;

export function RecentMeetings() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Recent Meetings</h2>
        <Link
          href="/dashboard/meetings"
          className="text-sm font-medium text-primary hover:text-primary/80"
        >
          View all history
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {meetings.map((meeting, index) => {
          const Icon = icons[index];
          return <MeetingListItem key={meeting.title} {...meeting} icon={Icon} />;
        })}
      </div>
    </section>
  );
}
