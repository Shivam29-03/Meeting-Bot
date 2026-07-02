import { RefreshCw } from "lucide-react";

export function MeetingsUpcomingSidebar() {
  return (
    <aside className="border-l border-slate-200 pl-6 xl:pl-8">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">Upcoming Today</h3>
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary uppercase">
          0 Sessions
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
        <p className="text-sm font-medium text-slate-900">No upcoming sessions</p>
        <p className="mt-1 text-xs text-slate-500">
          Sync your calendar to see scheduled meetings here.
        </p>
      </div>

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
