import { z } from "zod/v4";

export const appointmentSchema = z.object({
  branchId: z.string().min(1, "Branch is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  hour: z.number().int().min(0).max(23),
  customerName: z.string().optional(),
  phoneNumber: z.string().min(7, "Phone number must be at least 7 digits"),
  serviceId: z.string().min(1, "Service is required"),
  staffName: z.string().optional(),
  notes: z.string().optional(),
});

export const capacitySchema = z.object({
  branchId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  maxPerHour: z.number().int().min(1).max(50),
});

export const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum(["nails", "lashes", "combo", "other"]),
  price: z.number().positive("Price must be positive"),
  duration: z.number().int().positive("Duration must be positive"),
  isActive: z.boolean().default(true),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
export type CapacityFormData = z.infer<typeof capacitySchema>;
export type ServiceFormData = z.infer<typeof serviceSchema>;
