import NepaliDate from "nepali-date-converter";

export const BS_MONTHS = [
  "Baisakh", "Jestha", "Ashar", "Shrawan",
  "Bhadra", "Ashwin", "Kartik", "Mangsir",
  "Poush", "Magh", "Falgun", "Chaitra",
] as const;

export const BS_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** Convert AD "yyyy-MM-dd" string to a NepaliDate instance. */
function toNepaliDate(adDateStr: string): NepaliDate {
  const [year, month, day] = adDateStr.split("-").map(Number);
  const jsDate = new Date(year, month - 1, day);
  return new NepaliDate(jsDate);
}

/** Short display: "27 Shrawan" */
export function formatNepaliDateShort(adDateStr: string): string {
  const nd = toNepaliDate(adDateStr);
  return `${nd.getDate()} ${BS_MONTHS[nd.getMonth()]}`;
}

/** Full display: "27 Shrawan 2083" */
export function formatNepaliDateFull(adDateStr: string): string {
  const nd = toNepaliDate(adDateStr);
  return `${nd.getDate()} ${BS_MONTHS[nd.getMonth()]} ${nd.getYear()}`;
}

/** Get BS year, month (0-indexed), day from an AD date string. */
export function adToBS(adDateStr: string): { year: number; month: number; day: number } {
  const nd = toNepaliDate(adDateStr);
  return { year: nd.getYear(), month: nd.getMonth(), day: nd.getDate() };
}

/** Convert BS year, month (0-indexed), day to AD "yyyy-MM-dd" string. */
export function bsToAD(year: number, month: number, day: number): string {
  const nd = new NepaliDate(year, month, day);
  const jsDate = nd.toJsDate();
  const y = jsDate.getFullYear();
  const m = String(jsDate.getMonth() + 1).padStart(2, "0");
  const d = String(jsDate.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Get number of days in a BS month (0-indexed month). */
export function getDaysInBSMonth(year: number, month: number): number {
  const start = new NepaliDate(year, month, 1).toJsDate();
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const end = new NepaliDate(nextYear, nextMonth, 1).toJsDate();
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

/** Get the day of week (0=Sun, 6=Sat) for the 1st of a BS month. */
export function getFirstDayOfBSMonth(year: number, month: number): number {
  const jsDate = new NepaliDate(year, month, 1).toJsDate();
  return jsDate.getDay();
}

/** Get today's date as AD "yyyy-MM-dd". */
export function getTodayAD(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
