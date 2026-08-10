"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AppointmentForm } from "./appointment-form";
import type { Branch, Service } from "@/generated/prisma/client";
import type { AppointmentWithService } from "@/types";

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: Service[];
  branches: Branch[];
  selectedBranch: string;
  selectedDate: string;
  defaultHour: number | null;
  editAppointment: AppointmentWithService | null;
}

export function AppointmentDialog({
  open,
  onOpenChange,
  services,
  branches,
  selectedBranch,
  selectedDate,
  defaultHour,
  editAppointment,
}: AppointmentDialogProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>
            {editAppointment ? "Edit Appointment" : "New Appointment"}
          </SheetTitle>
        </SheetHeader>
        <AppointmentForm
          services={services}
          branches={branches}
          selectedBranch={selectedBranch}
          selectedDate={selectedDate}
          defaultHour={defaultHour}
          editAppointment={editAppointment}
          onSuccess={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
