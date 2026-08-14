"use server";

import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validations";
import { DEFAULT_MAX_PER_HOUR } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function createAppointment(formData: unknown): Promise<ActionResult> {
  const parsed = appointmentSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { branchId, date, hour, minute, numberOfPeople, phoneNumber, serviceId, customerName, staffName, notes } = parsed.data;

  try {
    const [capacity, aggregateResult] = await Promise.all([
      prisma.dailyCapacity.findUnique({
        where: { branchId_date: { branchId, date } },
      }),
      prisma.appointment.aggregate({
        where: { branchId, date, hour, status: { not: "cancelled" } },
        _sum: { numberOfPeople: true },
      }),
    ]);
    const maxPerHour = capacity?.maxPerHour ?? DEFAULT_MAX_PER_HOUR;
    const currentPeopleCount = aggregateResult._sum.numberOfPeople ?? 0;

    if (currentPeopleCount + numberOfPeople > maxPerHour) {
      return {
        success: false,
        error: `Cannot book ${numberOfPeople} people. This hour has ${currentPeopleCount}/${maxPerHour} people already.`,
      };
    }

    await prisma.appointment.create({
      data: {
        branchId,
        date,
        hour,
        minute,
        numberOfPeople,
        phoneNumber,
        serviceId,
        customerName: customerName || null,
        staffName: staffName || null,
        notes: notes || null,
        status: "confirmed",
      },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create appointment";
    return { success: false, error: message };
  }
}

export async function updateAppointment(id: string, formData: unknown): Promise<ActionResult> {
  const parsed = appointmentSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { branchId, date, hour, minute, numberOfPeople, phoneNumber, serviceId, customerName, staffName, notes } = parsed.data;

  try {
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Appointment not found" };

    const slotChanged = existing.branchId !== branchId || existing.date !== date || existing.hour !== hour;
    const peopleChanged = existing.numberOfPeople !== numberOfPeople;

    if (slotChanged || peopleChanged) {
      const [capacity, aggregateResult] = await Promise.all([
        prisma.dailyCapacity.findUnique({
          where: { branchId_date: { branchId, date } },
        }),
        prisma.appointment.aggregate({
          where: { branchId, date, hour, status: { not: "cancelled" }, id: { not: id } },
          _sum: { numberOfPeople: true },
        }),
      ]);
      const maxPerHour = capacity?.maxPerHour ?? DEFAULT_MAX_PER_HOUR;
      const currentPeopleCount = aggregateResult._sum.numberOfPeople ?? 0;

      if (currentPeopleCount + numberOfPeople > maxPerHour) {
        return {
          success: false,
          error: `Cannot fit ${numberOfPeople} people. This hour has ${currentPeopleCount}/${maxPerHour} people already.`,
        };
      }
    }

    await prisma.appointment.update({
      where: { id },
      data: {
        branchId,
        date,
        hour,
        minute,
        numberOfPeople,
        phoneNumber,
        serviceId,
        customerName: customerName || null,
        staffName: staffName || null,
        notes: notes || null,
      },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update appointment";
    return { success: false, error: message };
  }
}

export async function updateAppointmentStatus(id: string, status: string): Promise<ActionResult> {
  const validStatuses = ["confirmed", "completed", "cancelled", "no_show"];
  if (!validStatuses.includes(status)) {
    return { success: false, error: "Invalid status" };
  }

  try {
    await prisma.appointment.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update status" };
  }
}

export async function moveAppointmentBranch(id: string, targetBranchId: string): Promise<ActionResult> {
  try {
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) return { success: false, error: "Appointment not found" };
    if (appointment.branchId === targetBranchId) return { success: false, error: "Already in this branch" };

    const [capacity, aggregateResult] = await Promise.all([
      prisma.dailyCapacity.findUnique({
        where: { branchId_date: { branchId: targetBranchId, date: appointment.date } },
      }),
      prisma.appointment.aggregate({
        where: { branchId: targetBranchId, date: appointment.date, hour: appointment.hour, status: { not: "cancelled" } },
        _sum: { numberOfPeople: true },
      }),
    ]);
    const maxPerHour = capacity?.maxPerHour ?? DEFAULT_MAX_PER_HOUR;
    const currentPeopleCount = aggregateResult._sum.numberOfPeople ?? 0;

    if (currentPeopleCount + appointment.numberOfPeople > maxPerHour) {
      return {
        success: false,
        error: `Target branch is full at this hour (${currentPeopleCount}/${maxPerHour} people).`,
      };
    }

    await prisma.appointment.update({
      where: { id },
      data: { branchId: targetBranchId },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to move appointment" };
  }
}

export async function lookupCustomerByPhone(phone: string) {
  if (!phone || phone.trim().length < 7) return null;

  const appointment = await prisma.appointment.findFirst({
    where: { phoneNumber: phone.trim() },
    orderBy: { createdAt: "desc" },
    select: {
      customerName: true,
      serviceId: true,
      staffName: true,
      numberOfPeople: true,
    },
  });

  return appointment;
}

export async function deleteAppointment(id: string): Promise<ActionResult> {
  try {
    await prisma.appointment.delete({ where: { id } });
    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete appointment" };
  }
}
