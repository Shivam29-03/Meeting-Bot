import { RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";

const upcomingSessions = [
  {
    start: "3:30 PM",
    end: "4:00 PM",
    title: "1:1 with David (Marketing)",
    meta: "Zoom • 2 Participants",
    active: true,
  },
  {
    start: "5:00 PM",
    end: "6:00 PM",
    title: "Team Social Hour",
    meta: "Teams • Optional",
    active: false,
  },
  {
    start: "7:00 PM",
    end: "7:30 PM",
    title: "Project Recap",
    meta: "Google Meet • 4 Participants",
    active: false,
    muted: true,
  },
];

export function MeetingsUpcomingSidebar() {
  return (
    <aside className="border-l border-slate-200 pl-6 xl:pl-8">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">Upcoming Today</h3>
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary uppercase">
          3 Sessions
        </span>
      </div>

      <ul className="mt-4 space-y-3">
        {upcomingSessions.map((session) => (
          <li
            key={session.title}
            className={cn(
              "rounded-xl border p-4 transition-colors",
              session.muted
                ? "border-slate-200 bg-slate-50 opacity-70"
                : "border-slate-200 bg-white shadow-sm",
            )}
          >
            <p
              className={cn(
                "text-xs font-medium",
                session.active ? "text-primary" : "text-muted-foreground",
              )}
            >
              {session.start} – {session.end}
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">{session.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{session.meta}</p>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="mt-5 flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
      >
        <RefreshCw className="size-4" />
        Sync Calendar
      </button>
    </aside>
  );
}
