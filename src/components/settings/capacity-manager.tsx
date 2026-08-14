"use client";

import { useState, useTransition, lazy, Suspense } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const NepaliCalendar = lazy(() =>
  import("@/components/ui/nepali-calendar").then((m) => ({ default: m.NepaliCalendar }))
);
import { setDailyCapacity } from "@/actions/capacity-actions";
import { formatHour } from "@/lib/constants";
import { formatNepaliDateFull, getTodayAD } from "@/lib/nepali-date";
import { toast } from "sonner";
import type { Branch } from "@/generated/prisma/client";

export function CapacityManager({ branches }: { branches: Branch[] }) {
  const today = getTodayAD();
  const [selectedBranch, setSelectedBranch] = useState(branches[0]?.id ?? "");
  const [selectedDate, setSelectedDate] = useState(today);
  const [maxPerHour, setMaxPerHour] = useState("5");
  const [isPending, startTransition] = useTransition();
  const [calOpen, setCalOpen] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      const result = await setDailyCapacity({
        branchId: selectedBranch,
        date: selectedDate,
        maxPerHour: Number(maxPerHour),
      });

      if (result.success) {
        toast.success(`Capacity set to ${maxPerHour} per hour for ${formatNepaliDateFull(selectedDate)}`);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Capacity Settings</h2>

      <Card>
        <CardHeader className="pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-medium">Daily Maximum Per Hour</CardTitle>
          <p className="text-xs text-muted-foreground">
            Set one number per branch + date. This limit applies to every hour of that day.
          </p>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Branch selection */}
            <div className="space-y-2">
              <Label>Branch</Label>
              <div className="flex gap-2">
                {branches.map((branch) => (
                  <Button
                    key={branch.id}
                    type="button"
                    variant={selectedBranch === branch.id ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setSelectedBranch(branch.id)}
                  >
                    {branch.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date selection */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover open={calOpen} onOpenChange={setCalOpen}>
                <PopoverTrigger className="inline-flex w-full items-center justify-start gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm font-normal transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                  <CalendarDays className="h-4 w-4" />
                  {formatNepaliDateFull(selectedDate)}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Suspense fallback={<div className="w-[280px] h-[320px] animate-pulse bg-muted rounded-lg" />}>
                    <NepaliCalendar
                      selected={selectedDate}
                      onSelect={(adDate) => {
                        setSelectedDate(adDate);
                        setCalOpen(false);
                      }}
                    />
                  </Suspense>
                </PopoverContent>
              </Popover>
            </div>

            {/* Max per hour */}
            <div className="space-y-2">
              <Label>Maximum people per hour</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={maxPerHour}
                onChange={(e) => setMaxPerHour(e.target.value)}
                className="text-center text-lg font-semibold"
              />
              <p className="text-xs text-muted-foreground">
                Every hour from opening to closing will allow up to {maxPerHour} people.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Saving..." : "Set Capacity"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Branch info */}
      <Card>
        <CardHeader className="pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-medium">Branch Hours</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2">
          {branches.map((branch) => (
            <div key={branch.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="text-sm font-medium">{branch.name}</p>
                <p className="text-xs text-muted-foreground">{branch.address}</p>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {formatHour(branch.openingHour)} - {formatHour(branch.closingHour)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
