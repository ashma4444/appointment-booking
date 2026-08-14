"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  hashPin,
  verifyPinHash,
  createSessionToken,
  verifySessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/auth";
import type { ActionResult } from "@/types";

export async function loginWithPin(pin: string): Promise<ActionResult> {
  if (!pin || pin.length < 4 || pin.length > 10) {
    return { success: false, error: "PIN must be 4-10 digits" };
  }

  let setting = await prisma.appSettings.findUnique({
    where: { key: "pinHash" },
  });

  // First-time: seed default PIN "12345"
  if (!setting) {
    const defaultHash = hashPin("12345");
    setting = await prisma.appSettings.create({
      data: { key: "pinHash", value: defaultHash },
    });
  }

  if (!verifyPinHash(pin, setting.value)) {
    return { success: false, error: "Incorrect PIN" };
  }

  const token = createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return { success: true };
}

export async function changePin(
  currentPin: string,
  newPin: string
): Promise<ActionResult> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie || !verifySessionToken(sessionCookie.value)) {
    return { success: false, error: "Not authenticated" };
  }

  if (!newPin || newPin.length < 4 || newPin.length > 10) {
    return { success: false, error: "New PIN must be 4-10 digits" };
  }

  const setting = await prisma.appSettings.findUnique({
    where: { key: "pinHash" },
  });

  if (!setting || !verifyPinHash(currentPin, setting.value)) {
    return { success: false, error: "Current PIN is incorrect" };
  }

  const newHash = hashPin(newPin);
  await prisma.appSettings.update({
    where: { key: "pinHash" },
    data: { value: newHash },
  });

  return { success: true };
}

export async function logout(): Promise<ActionResult> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return { success: true };
}
