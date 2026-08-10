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

  const { branchId, date, hour, phoneNumber, serviceId, customerName, staffName, notes } = parsed.data;

  try {
    // Get capacity for this branch+date
    const capacity = await prisma.dailyCapacity.findUnique({
      where: { branchId_date: { branchId, date } },
    });
    const maxPerHour = capacity?.maxPerHour ?? DEFAULT_MAX_PER_HOUR;

    // Count existing non-cancelled appointments for this slot
    const currentCount = await prisma.appointment.count({
      where: { branchId, date, hour, status: { not: "cancelled" } },
    });

    if (currentCount >= maxPerHour) {
      return {
        success: false,
        error: `This time slot is fully booked. Maximum ${maxPerHour} appointments are allowed per hour.`,
      };
    }

    await prisma.appointment.create({
      data: {
        branchId,
        date,
        hour,
        phoneNumber,
        serviceId,
        customerName: customerName || null,
        staffName: staffName || null,
        notes: notes || null,
        status: "confirmed",
      },
    });

    revalidatePath("/appointments");
    revalidatePath("/dashboard");
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

  const { branchId, date, hour, phoneNumber, serviceId, customerName, staffName, notes } = parsed.data;

  try {
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Appointment not found" };

    const slotChanged = existing.branchId !== branchId || existing.date !== date || existing.hour !== hour;

    if (slotChanged) {
      const capacity = await prisma.dailyCapacity.findUnique({
        where: { branchId_date: { branchId, date } },
      });
      const maxPerHour = capacity?.maxPerHour ?? DEFAULT_MAX_PER_HOUR;

      const currentCount = await prisma.appointment.count({
        where: { branchId, date, hour, status: { not: "cancelled" }, id: { not: id } },
      });

      if (currentCount >= maxPerHour) {
        return {
          success: false,
          error: `The new time slot is fully booked (${currentCount}/${maxPerHour}).`,
        };
      }
    }

    await prisma.appointment.update({
      where: { id },
      data: {
        branchId,
        date,
        hour,
        phoneNumber,
        serviceId,
        customerName: customerName || null,
        staffName: staffName || null,
        notes: notes || null,
      },
    });

    revalidatePath("/appointments");
    revalidatePath("/dashboard");
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
    revalidatePath("/appointments");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update status" };
  }
}

export async function deleteAppointment(id: string): Promise<ActionResult> {
  try {
    await prisma.appointment.delete({ where: { id } });
    revalidatePath("/appointments");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete appointment" };
  }
}
