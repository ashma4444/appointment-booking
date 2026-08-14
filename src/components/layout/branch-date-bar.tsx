"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format, addDays, subDays, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatNepaliDateShort } from "@/lib/nepali-date";
import { useState, lazy, Suspense } from "react";

const NepaliCalendar = lazy(() =>
  import("@/components/ui/nepali-calendar").then((m) => ({ default: m.NepaliCalendar }))
);
import type { Branch } from "@/generated/prisma/client";

export function BranchDateBar({ branches }: { branches: Branch[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [calOpen, setCalOpen] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");
  const selectedDate = searchParams.get("date") || today;
  const selectedBranch = searchParams.get("branch") || branches[0]?.id || "";

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  function goDate(date: string) {
    setParam("date", date);
  }

  const goPrev = () => goDate(format(subDays(parseISO(selectedDate), 1), "yyyy-MM-dd"));
  const goNext = () => goDate(format(addDays(parseISO(selectedDate), 1), "yyyy-MM-dd"));
  const goToday = () => goDate(today);

  const isToday = selectedDate === today;
  const displayDate = formatNepaliDateShort(selectedDate);

  return (
    <div className="sticky top-14 z-30 border-b bg-background px-4 py-2 space-y-2">
      {/* Branch selector */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {branches.map((branch) => (
          <Button
            key={branch.id}
            variant={selectedBranch === branch.id ? "default" : "outline"}
            size="sm"
            className="shrink-0 rounded-full text-xs h-8"
            onClick={() => setParam("branch", branch.id)}
          >
            {branch.name}
          </Button>
        ))}
      </div>

      {/* Date navigation */}
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goPrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          {!isToday && (
            <Button variant="outline" size="sm" className="h-7 text-xs rounded-full" onClick={goToday}>
              Today
            </Button>
          )}
          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              <CalendarDays className="h-4 w-4" />
              {isToday ? "Today" : displayDate}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Suspense fallback={<div className="w-[280px] h-[320px] animate-pulse bg-muted rounded-lg" />}>
                <NepaliCalendar
                  selected={selectedDate}
                  onSelect={(adDate) => {
                    goDate(adDate);
                    setCalOpen(false);
                  }}
                />
              </Suspense>
            </PopoverContent>
          </Popover>
        </div>

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
