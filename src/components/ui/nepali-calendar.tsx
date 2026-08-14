"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  adToBS,
  bsToAD,
  getDaysInBSMonth,
  getFirstDayOfBSMonth,
  getTodayAD,
  BS_MONTHS,
  BS_WEEKDAYS,
} from "@/lib/nepali-date";
import { cn } from "@/lib/utils";

interface NepaliCalendarProps {
  selected?: string; // AD "yyyy-MM-dd"
  onSelect?: (adDate: string) => void;
  className?: string;
}

export function NepaliCalendar({ selected, onSelect, className }: NepaliCalendarProps) {
  const todayAD = getTodayAD();
  const todayBS = adToBS(todayAD);

  const initialBS = selected ? adToBS(selected) : todayBS;
  const [viewYear, setViewYear] = useState(initialBS.year);
  const [viewMonth, setViewMonth] = useState(initialBS.month);

  const selectedBS = selected ? adToBS(selected) : null;

  const daysInMonth = useMemo(() => getDaysInBSMonth(viewYear, viewMonth), [viewYear, viewMonth]);
  const firstDayOfWeek = useMemo(() => getFirstDayOfBSMonth(viewYear, viewMonth), [viewYear, viewMonth]);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  function handleDayClick(day: number) {
    const adDate = bsToAD(viewYear, viewMonth, day);
    onSelect?.(adDate);
  }

  const isToday = (day: number) =>
    viewYear === todayBS.year && viewMonth === todayBS.month && day === todayBS.day;

  const isSelected = (day: number) =>
    selectedBS !== null &&
    viewYear === selectedBS.year &&
    viewMonth === selectedBS.month &&
    day === selectedBS.day;

  // Build grid cells: leading empty + day cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  return (
    <div className={cn("p-3 w-[280px]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold">
          {BS_MONTHS[viewMonth]} {viewYear}
        </span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {BS_WEEKDAYS.map((wd) => (
          <div key={wd} className="text-center text-[10px] font-medium text-muted-foreground py-1">
            {wd}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => (
          <div key={i} className="flex items-center justify-center">
            {day !== null ? (
              <button
                type="button"
                onClick={() => handleDayClick(day)}
                className={cn(
                  "h-8 w-8 rounded-md text-sm transition-colors hover:bg-accent",
                  isSelected(day) && "bg-primary text-primary-foreground hover:bg-primary/90",
                  isToday(day) && !isSelected(day) && "bg-accent font-bold",
                )}
              >
                {day}
              </button>
            ) : (
              <div className="h-8 w-8" />
            )}
          </div>
        ))}
      </div>

      {/* Today shortcut */}
      <div className="mt-2 flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-7"
          onClick={() => {
            setViewYear(todayBS.year);
            setViewMonth(todayBS.month);
            onSelect?.(todayAD);
          }}
        >
          Today
        </Button>
      </div>
    </div>
  );
}
