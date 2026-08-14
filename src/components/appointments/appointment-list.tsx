"use client";

import { useState, useMemo } from "react";
import { Plus, Users, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HourRow } from "./hour-row";
import { AppointmentDialog } from "./appointment-dialog";
import type { AppointmentWithService, HourSlot } from "@/types";
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
  const [rebookFrom, setRebookFrom] = useState<AppointmentWithService | null>(null);

  const totalPeople = hourSlots.reduce((sum, s) => sum + s.count, 0);
  const totalAppointments = hourSlots.reduce(
    (sum, s) => sum + s.appointments.filter((a) => a.status !== "cancelled").length,
    0
  );

  function handleAdd(hour: number) {
    setEditId(null);
    setRebookFrom(null);
    setDefaultHour(hour);
    setDialogOpen(true);
  }

  function handleEdit(appointmentId: string) {
    setEditId(appointmentId);
    setRebookFrom(null);
    setDefaultHour(null);
    setDialogOpen(true);
  }

  const appointmentMap = useMemo(() => {
    const map = new Map<string, AppointmentWithService>();
    for (const slot of hourSlots) {
      for (const apt of slot.appointments) {
        map.set(apt.id, apt);
      }
    }
    return map;
  }, [hourSlots]);

  function handleRebook(appointmentId: string) {
    const apt = appointmentMap.get(appointmentId);
    if (!apt) return;
    setEditId(null);
    setDefaultHour(null);
    setRebookFrom(apt);
    setDialogOpen(true);
  }

  const editAppointment = editId ? appointmentMap.get(editId) ?? null : null;

  return (
    <div className="p-4 space-y-3">
      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <CalendarCheck className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold tabular-nums">{totalAppointments}</span>
            <span className="text-xs text-muted-foreground">bookings</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-violet-600" />
            <span className="text-sm font-semibold tabular-nums">{totalPeople}</span>
            <span className="text-xs text-muted-foreground">people</span>
          </div>
          <Badge variant="outline" className="text-[10px]">
            {maxPerHour}/hr
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
            branches={branches}
            selectedBranch={selectedBranch}
            onAdd={() => handleAdd(slot.hour)}
            onEdit={handleEdit}
            onRebook={handleRebook}
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
        rebookFrom={rebookFrom}
      />
    </div>
  );
}
