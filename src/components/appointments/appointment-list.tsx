"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HourRow } from "./hour-row";
import { AppointmentDialog } from "./appointment-dialog";
import { formatHour } from "@/lib/constants";
import type { HourSlot } from "@/types";
import type { Branch, Service } from "@/generated/prisma/client";

interface AppointmentListProps {
  hourSlots: HourSlot[];
  services: Service[];
  branches: Branch[];
  selectedBranch: string;
  selectedDate: string;
  maxPerHour: number;
}

export function AppointmentList({
  hourSlots,
  services,
  branches,
  selectedBranch,
  selectedDate,
  maxPerHour,
}: AppointmentListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [defaultHour, setDefaultHour] = useState<number | null>(null);

  const totalNonCancelled = hourSlots.reduce((sum, s) => sum + s.count, 0);

  function handleAdd(hour: number) {
    setEditId(null);
    setDefaultHour(hour);
    setDialogOpen(true);
  }

  function handleEdit(appointmentId: string) {
    setEditId(appointmentId);
    setDefaultHour(null);
    setDialogOpen(true);
  }

  const editAppointment = editId
    ? hourSlots.flatMap((s) => s.appointments).find((a) => a.id === editId)
    : null;

  return (
    <div className="p-4 space-y-3">
      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{totalNonCancelled} appointments</span>
          <Badge variant="outline" className="text-xs">
            Max {maxPerHour}/hr
          </Badge>
        </div>
        <Button
          size="sm"
          className="h-8 gap-1.5 rounded-full"
          onClick={() => {
            setEditId(null);
            setDefaultHour(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Hour slots */}
      <div className="space-y-2">
        {hourSlots.map((slot) => (
          <HourRow
            key={slot.hour}
            slot={slot}
            onAdd={() => handleAdd(slot.hour)}
            onEdit={handleEdit}
          />
        ))}
      </div>

      <AppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        services={services}
        branches={branches}
        selectedBranch={selectedBranch}
        selectedDate={selectedDate}
        defaultHour={defaultHour}
        editAppointment={editAppointment ?? null}
      />
    </div>
  );
}
