"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function getDataStats() {
  const [appointmentCount, capacityCount] = await Promise.all([
    prisma.appointment.count(),
    prisma.dailyCapacity.count(),
  ]);
  return { appointmentCount, capacityCount };
}

export async function deleteOldAppointments(beforeDate: string): Promise<ActionResult & { deleted?: number }> {
  try {
    const result = await prisma.appointment.deleteMany({
      where: { date: { lt: beforeDate } },
    });

    // Also clean up old daily capacity records
    await prisma.dailyCapacity.deleteMany({
      where: { date: { lt: beforeDate } },
    });

    revalidatePath("/", "layout");
    return { success: true, deleted: result.count };
  } catch {
    return { success: false, error: "Failed to delete old data" };
  }
}

export async function deleteAllAppointments(): Promise<ActionResult & { deleted?: number }> {
  try {
    const result = await prisma.appointment.deleteMany({});
    await prisma.dailyCapacity.deleteMany({});

    revalidatePath("/", "layout");
    return { success: true, deleted: result.count };
  } catch {
    return { success: false, error: "Failed to delete data" };
  }
}
