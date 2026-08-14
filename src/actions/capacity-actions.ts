"use server";

import { prisma } from "@/lib/prisma";
import { capacitySchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function setDailyCapacity(formData: unknown): Promise<ActionResult> {
  const parsed = capacitySchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { branchId, date, maxPerHour } = parsed.data;

  try {
    await prisma.dailyCapacity.upsert({
      where: { branchId_date: { branchId, date } },
      update: { maxPerHour },
      create: { branchId, date, maxPerHour },
    });
    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to set capacity" };
  }
}
