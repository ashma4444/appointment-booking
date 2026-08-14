import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { DEFAULT_MAX_PER_HOUR } from "@/lib/constants";
import { BranchDateBar } from "@/components/layout/branch-date-bar";
import { AppointmentList } from "@/components/appointments/appointment-list";
import { Suspense } from "react";
import type { HourSlot } from "@/types";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string; date?: string; status?: string }>;
}) {
  const params = await searchParams;
  const today = format(new Date(), "yyyy-MM-dd");
  const selectedDate = params.date || today;

  const [branches, services] = await Promise.all([
    prisma.branch.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.service.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);
  const selectedBranch = params.branch || branches[0]?.id || "";

  const branch = branches.find((b) => b.id === selectedBranch);
  if (!branch) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">No branches configured.</p>
      </div>
    );
  }

  const where: Record<string, unknown> = {
    branchId: selectedBranch,
    date: selectedDate,
  };
  if (params.status) where.status = params.status;

  const [capacity, appointments] = await Promise.all([
    prisma.dailyCapacity.findUnique({
      where: { branchId_date: { branchId: selectedBranch, date: selectedDate } },
    }),
    prisma.appointment.findMany({
      where,
      include: { service: true },
      orderBy: [{ hour: "asc" }, { minute: "asc" }, { createdAt: "asc" }],
    }),
  ]);
  const maxPerHour = capacity?.maxPerHour ?? DEFAULT_MAX_PER_HOUR;

  // Pre-group by hour in a single pass
  const byHour: Record<number, typeof appointments> = {};
  for (const apt of appointments) {
    (byHour[apt.hour] ??= []).push(apt);
  }
  const hourSlots: HourSlot[] = [];
  for (let h = branch.openingHour; h <= branch.closingHour; h++) {
    const slotAppointments = byHour[h] ?? [];
    const nonCancelledCount = slotAppointments
      .filter((a) => a.status !== "cancelled")
      .reduce((sum, a) => sum + a.numberOfPeople, 0);
    hourSlots.push({
      hour: h,
      appointments: slotAppointments,
      count: nonCancelledCount,
      maxPerHour,
    });
  }

  return (
    <>
      <Suspense>
        <BranchDateBar branches={branches} />
      </Suspense>
      <AppointmentList
        hourSlots={hourSlots}
        services={services}
        branches={branches}
        selectedBranch={selectedBranch}
        selectedDate={selectedDate}
        maxPerHour={maxPerHour}
      />
    </>
  );
}
