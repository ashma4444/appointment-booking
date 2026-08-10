"use server";

import { prisma } from "@/lib/prisma";
import { serviceSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function createService(formData: unknown): Promise<ActionResult> {
  const parsed = serviceSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await prisma.service.create({ data: parsed.data });
    revalidatePath("/services");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to create service" };
  }
}

export async function updateService(id: string, formData: unknown): Promise<ActionResult> {
  const parsed = serviceSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await prisma.service.update({ where: { id }, data: parsed.data });
    revalidatePath("/services");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update service" };
  }
}

export async function deleteService(id: string): Promise<ActionResult> {
  try {
    await prisma.service.delete({ where: { id } });
    revalidatePath("/services");
    return { success: true };
  } catch {
    return { success: false, error: "Cannot delete service — it may have linked appointments. Try deactivating instead." };
  }
}

export async function toggleServiceActive(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    await prisma.service.update({ where: { id }, data: { isActive } });
    revalidatePath("/services");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to toggle service" };
  }
}
