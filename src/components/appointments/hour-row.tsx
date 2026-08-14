"use client";

import { memo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppointmentCard } from "./appointment-card";
import { formatHour } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { HourSlot } from "@/types";
import type { Branch } from "@/generated/prisma/client";

interface HourRowProps {
  slot: HourSlot;
  branches: Branch[];
  selectedBranch: string;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onRebook: (id: string) => void;
}

export const HourRow = memo(function HourRow({ slot, branches, selectedBranch, onAdd, onEdit, onRebook }: HourRowProps) {
  const { hour, appointments, count, maxPerHour } = slot;
  const isFull = count >= maxPerHour;
  const isAlmostFull = count >= maxPerHour * 0.7 && !isFull;
  const nonCancelled = appointments.filter((a) => a.status !== "cancelled");
  const cancelled = appointments.filter((a) => a.status === "cancelled");

  const borderColor = isFull
    ? "border-l-red-400"
    : isAlmostFull
      ? "border-l-amber-400"
      : count > 0
        ? "border-l-emerald-400"
        : "border-l-transparent";

  return (
    <div
      className={cn(
        "rounded-lg border border-l-4 bg-card p-3",
        borderColor,
        isFull && "bg-red-50/50"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold font-mono">{formatHour(hour)}</span>
          <Badge
            variant={isFull ? "destructive" : "secondary"}
            className="text-[10px] h-5 px-1.5 tabular-nums"
          >
            {count}/{maxPerHour}
            {isFull && " FULL"}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={isFull}
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Appointment cards */}
      {nonCancelled.length > 0 && (
        <div className="space-y-1.5">
          {nonCancelled.map((apt) => (
            <AppointmentCard key={apt.id} appointment={apt} branches={branches} selectedBranch={selectedBranch} onEdit={() => onEdit(apt.id)} onRebook={() => onRebook(apt.id)} />
          ))}
        </div>
      )}

      {cancelled.length > 0 && (
        <div className="mt-2 space-y-1">
          {cancelled.map((apt) => (
            <AppointmentCard key={apt.id} appointment={apt} branches={branches} selectedBranch={selectedBranch} onEdit={() => onEdit(apt.id)} onRebook={() => onRebook(apt.id)} />
          ))}
        </div>
      )}

      {appointments.length === 0 && (
        <p className="text-xs text-muted-foreground">No appointments</p>
      )}
    </div>
  );
});
