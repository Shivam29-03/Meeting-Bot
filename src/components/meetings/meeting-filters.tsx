"use client";

import { Check, ChevronDown, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui";
import type {
  DateFilter,
  DurationSort,
  MeetingListFilters,
} from "@/lib/meeting-list-filters";
import { cn } from "@/lib/utils";

export type MeetingFilterTab = "all" | "completed";

type MeetingFiltersProps = {
  activeTab: MeetingFilterTab;
  filters: MeetingListFilters;
  onTabChange: (tab: MeetingFilterTab) => void;
  onFiltersChange: (filters: MeetingListFilters) => void;
};

type FilterMenu = "hosted" | "date" | "duration" | null;

const dateOptions: { value: DateFilter; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "today", label: "Today" },
  { value: "week", label: "Past 7 days" },
  { value: "month", label: "Past 30 days" },
];

const durationOptions: { value: DurationSort; label: string }[] = [
  { value: "longest", label: "Longest first" },
  { value: "shortest", label: "Shortest first" },
];

function getDateFilterLabel(value: DateFilter) {
  return dateOptions.find((option) => option.value === value)?.label ?? value;
}

function getDurationSortLabel(value: DurationSort) {
  return durationOptions.find((option) => option.value === value)?.label ?? value;
}

export function MeetingFilters({
  activeTab,
  filters,
  onTabChange,
  onFiltersChange,
}: MeetingFiltersProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<FilterMenu>(null);

  const closeDropdown = () => {
    setFiltersOpen(false);
    setActiveMenu(null);
  };

  const toggleHostedByMe = () => {
    onFiltersChange({
      ...filters,
      hostedByMe: !filters.hostedByMe,
    });
  };

  const setDateFilter = (dateFilter: DateFilter) => {
    onFiltersChange({
      ...filters,
      dateFilter: filters.dateFilter === dateFilter ? null : dateFilter,
    });
    closeDropdown();
  };

  const setDurationSort = (durationSort: DurationSort) => {
    onFiltersChange({
      ...filters,
      durationSort: filters.durationSort === durationSort ? null : durationSort,
    });
    closeDropdown();
  };

  const clearFilters = () => {
    onFiltersChange({
      hostedByMe: false,
      dateFilter: null,
      durationSort: null,
    });
  };

  const hasActiveFilters =
    filters.hostedByMe || filters.dateFilter || filters.durationSort;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFiltersOpen((open) => !open);
              setActiveMenu(null);
            }}
            className={cn(
              "h-9 gap-2 rounded-lg border-slate-200 bg-white px-4 text-sm font-medium text-foreground hover:bg-slate-50",
              hasActiveFilters && "border-primary/30 bg-primary/5",
            )}
          >
            Filters
            {hasActiveFilters ? (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {(filters.hostedByMe ? 1 : 0) +
                  (filters.dateFilter ? 1 : 0) +
                  (filters.durationSort ? 1 : 0)}
              </span>
            ) : null}
            <ChevronDown className="size-4" />
          </Button>

          {filtersOpen ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10"
                aria-label="Close filters"
                onClick={closeDropdown}
              />
              <div className="absolute top-full left-0 z-20 mt-2 flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                <div className="min-w-[180px] py-1">
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-slate-50",
                      activeMenu === "hosted" && "bg-slate-50",
                    )}
                    onClick={() => {
                      toggleHostedByMe();
                    }}
                  >
                    <span>Hosted by me</span>
                    {filters.hostedByMe ? (
                      <Check className="size-4 text-primary" />
                    ) : null}
                  </button>

                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-slate-50",
                      activeMenu === "date" && "bg-slate-50",
                    )}
                    onClick={() =>
                      setActiveMenu((menu) => (menu === "date" ? null : "date"))
                    }
                  >
                    <span>Date</span>
                    <ChevronDown
                      className={cn(
                        "size-4 text-slate-400 transition-transform",
                        activeMenu === "date" && "-rotate-90",
                      )}
                    />
                  </button>

                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-slate-50",
                      activeMenu === "duration" && "bg-slate-50",
                    )}
                    onClick={() =>
                      setActiveMenu((menu) =>
                        menu === "duration" ? null : "duration",
                      )
                    }
                  >
                    <span>Duration</span>
                    <ChevronDown
                      className={cn(
                        "size-4 text-slate-400 transition-transform",
                        activeMenu === "duration" && "-rotate-90",
                      )}
                    />
                  </button>
                </div>

                {activeMenu === "date" ? (
                  <div className="min-w-[180px] border-l border-slate-200 py-1">
                    {dateOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-slate-50"
                        onClick={() => setDateFilter(option.value)}
                      >
                        <span>{option.label}</span>
                        {filters.dateFilter === option.value ? (
                          <Check className="size-4 text-primary" />
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : null}

                {activeMenu === "duration" ? (
                  <div className="min-w-[180px] border-l border-slate-200 py-1">
                    {durationOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-slate-50"
                        onClick={() => setDurationSort(option.value)}
                      >
                        <span>{option.label}</span>
                        {filters.durationSort === option.value ? (
                          <Check className="size-4 text-primary" />
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : null}
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

      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center gap-2">
          {filters.hostedByMe ? (
            <FilterChip
              label="Hosted by me"
              onRemove={() => onFiltersChange({ ...filters, hostedByMe: false })}
            />
          ) : null}
          {filters.dateFilter ? (
            <FilterChip
              label={getDateFilterLabel(filters.dateFilter)}
              onRemove={() => onFiltersChange({ ...filters, dateFilter: null })}
            />
          ) : null}
          {filters.durationSort ? (
            <FilterChip
              label={getDurationSortLabel(filters.durationSort)}
              onRemove={() => onFiltersChange({ ...filters, durationSort: null })}
            />
          ) : null}
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-medium text-primary hover:text-primary/80"
          >
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 hover:bg-slate-200"
        aria-label={`Remove ${label} filter`}
      >
        <X className="size-3" />
      </button>
    </span>
  );
}
