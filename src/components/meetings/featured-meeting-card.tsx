import { Clock, Users } from "lucide-react";

import { Avatar, AvatarFallback, Button, Card } from "@/components/ui";

export function FeaturedMeetingCard() {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm ring-0">
      <div className="flex flex-col lg:flex-row">
        <div className="relative min-h-[200px] flex-1 overflow-hidden lg:max-w-[300px]">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900" />
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-md bg-red-500 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
            <span className="size-1.5 animate-pulse rounded-full bg-white" />
            Live
          </div>
          <div className="absolute inset-0 grid grid-cols-2 gap-2 p-6">
            {[1, 2, 3, 4].map((tile) => (
              <div
                key={tile}
                className="flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm"
              >
                <div className="size-10 rounded-full bg-gradient-to-br from-slate-400/50 to-slate-600/50" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex-1">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
              Currently In Progress
            </p>
            <h3 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
              Q4 Product Roadmap Sync
            </h3>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                Started 12 mins ago
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="size-4" />
                10 participants
              </span>
            </div>
            <span className="mt-3 inline-flex rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-primary uppercase">
              AI Summarizing
            </span>
          </div>

          <div className="flex flex-col items-start gap-4 sm:items-end">
            <div className="flex -space-x-2">
              {["D", "S"].map((initial) => (
                <Avatar key={initial} size="sm" className="size-9 border-2 border-white">
                  <AvatarFallback className="bg-indigo-100 text-xs font-semibold text-indigo-700">
                    {initial}
                  </AvatarFallback>
                </Avatar>
              ))}
              <span className="flex size-9 items-center justify-center rounded-full border-2 border-white bg-primary text-xs font-semibold text-white">
                +8
              </span>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto">
              <Button className="h-10 rounded-xl bg-slate-900 px-6 text-sm font-semibold hover:bg-slate-800">
                Join Call
              </Button>
              <Button variant="outline" className="h-10 rounded-xl px-6 text-sm font-semibold">
                View Notes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
