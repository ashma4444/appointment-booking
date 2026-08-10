"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { setDailyCapacity } from "@/actions/capacity-actions";
import { formatHour } from "@/lib/constants";
import { toast } from "sonner";
import type { Branch } from "@/generated/prisma/client";

export function CapacityManager({ branches }: { branches: Branch[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const today = format(new Date(), "yyyy-MM-dd");
  const [selectedBranch, setSelectedBranch] = useState(branches[0]?.id ?? "");
  const [selectedDate, setSelectedDate] = useState(today);
  const [maxPerHour, setMaxPerHour] = useState("5");
  const [loading, setLoading] = useState(false);
  const [calOpen, setCalOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await setDailyCapacity({
      branchId: selectedBranch,
      date: selectedDate,
      maxPerHour: Number(maxPerHour),
    });

    setLoading(false);

    if (result.success) {
      toast.success(`Capacity set to ${maxPerHour} per hour for ${format(parseISO(selectedDate), "MMM d, yyyy")}`);
    } else {
      toast.error(result.error);
    }
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
                  {format(parseISO(selectedDate), "EEEE, MMMM d, yyyy")}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={parseISO(selectedDate)}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(format(date, "yyyy-MM-dd"));
                        setCalOpen(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Max per hour */}
            <div className="space-y-2">
              <Label>Maximum appointments per hour</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={maxPerHour}
                onChange={(e) => setMaxPerHour(e.target.value)}
                className="text-center text-lg font-semibold"
              />
              <p className="text-xs text-muted-foreground">
                Every hour from opening to closing will allow up to {maxPerHour} appointments.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Set Capacity"}
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
