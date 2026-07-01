"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export type MeetingFilterTab = "all" | "completed";

type MeetingFiltersProps = {
  activeTab: MeetingFilterTab;
  onTabChange: (tab: MeetingFilterTab) => void;
};

const filterOptions = ["Hosted by me", "Duration", "Date"];

export function MeetingFilters({ activeTab, onTabChange }: MeetingFiltersProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          onClick={() => setFiltersOpen((open) => !open)}
          className="h-9 gap-2 rounded-lg border-slate-200 bg-white px-4 text-sm font-medium text-foreground hover:bg-slate-50"
        >
          Filters
          <ChevronDown className="size-4" />
        </Button>

        {filtersOpen ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-10"
              aria-label="Close filters"
              onClick={() => setFiltersOpen(false)}
            />
            <div className="absolute top-full left-0 z-20 mt-2 min-w-[160px] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              {filterOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setFiltersOpen(false)}
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onTabChange("all")}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            activeTab === "all"
              ? "bg-slate-900 text-white"
              : "text-muted-foreground hover:bg-slate-100 hover:text-foreground",
          )}
        >
          All Meetings
        </button>
        <button
          type="button"
          onClick={() => onTabChange("completed")}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            activeTab === "completed"
              ? "bg-slate-100 text-foreground"
              : "text-muted-foreground hover:bg-slate-100 hover:text-foreground",
          )}
        >
          Completed
        </button>
      </div>
    </div>
  );
}
