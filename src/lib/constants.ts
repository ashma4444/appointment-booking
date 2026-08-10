export const APPOINTMENT_STATUSES = [
  { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-800" },
  { value: "completed", label: "Completed", color: "bg-emerald-100 text-emerald-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-500" },
  { value: "no_show", label: "No Show", color: "bg-red-100 text-red-800" },
] as const;

export const SERVICE_CATEGORIES = [
  { value: "nails", label: "Nails" },
  { value: "lashes", label: "Lashes" },
  { value: "combo", label: "Combo" },
  { value: "other", label: "Other" },
] as const;

export const DEFAULT_MAX_PER_HOUR = 3;

export function formatHour(hour: number): string {
  if (hour === 0) return "12:00 AM";
  if (hour < 12) return `${hour}:00 AM`;
  if (hour === 12) return "12:00 PM";
  return `${hour - 12}:00 PM`;
}

export function getStatusColor(status: string) {
  return APPOINTMENT_STATUSES.find((s) => s.value === status)?.color ?? "bg-gray-100 text-gray-600";
}

export function getStatusLabel(status: string) {
  return APPOINTMENT_STATUSES.find((s) => s.value === status)?.label ?? status;
}
