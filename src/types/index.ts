import type { Appointment, Branch, DailyCapacity, Service } from "@/generated/prisma/client";

export type AppointmentWithService = Appointment & {
  service: Service;
};

export type AppointmentWithRelations = Appointment & {
  service: Service;
  branch: Branch;
};

export type HourSlot = {
  hour: number;
  appointments: AppointmentWithService[];
  count: number;
  maxPerHour: number;
};

export type ActionResult = {
  success: boolean;
  error?: string;
};

export type BranchWithCapacity = Branch & {
  dailyCapacities: DailyCapacity[];
};
