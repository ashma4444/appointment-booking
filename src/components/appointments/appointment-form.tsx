"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAppointment, updateAppointment, lookupCustomerByPhone } from "@/actions/appointment-actions";
import { toast } from "sonner";
import type { Branch, Service } from "@/generated/prisma/client";
import type { AppointmentWithService } from "@/types";

interface AppointmentFormProps {
  services: Service[];
  branches: Branch[];
  selectedBranch: string;
  selectedDate: string;
  defaultHour: number | null;
  editAppointment: AppointmentWithService | null;
  rebookFrom: AppointmentWithService | null;
  onSuccess: () => void;
}

function toTimeString(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function parseTimeString(val: string): { hour: number; minute: number } {
  const [h, m] = val.split(":").map(Number);
  return { hour: h ?? 0, minute: m ?? 0 };
}

export function AppointmentForm({
  services,
  branches,
  selectedBranch,
  selectedDate,
  defaultHour,
  editAppointment,
  rebookFrom,
  onSuccess,
}: AppointmentFormProps) {
  const branch = branches.find((b) => b.id === selectedBranch);
  const isEdit = !!editAppointment;
  const prefill = editAppointment ?? rebookFrom;

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [phoneNumber, setPhoneNumber] = useState(prefill?.phoneNumber ?? "");
  const [customerName, setCustomerName] = useState(prefill?.customerName ?? "");
  const [serviceId, setServiceId] = useState(prefill?.serviceId ?? "");
  const [timeValue, setTimeValue] = useState(() => {
    const h = editAppointment?.hour ?? defaultHour ?? branch?.openingHour ?? 7;
    const m = editAppointment?.minute ?? 0;
    return toTimeString(h, m);
  });
  const [numberOfPeople, setNumberOfPeople] = useState<number | "">(prefill?.numberOfPeople ?? 1);
  const [staffName, setStaffName] = useState(prefill?.staffName ?? "");
  const [notes, setNotes] = useState(editAppointment?.notes ?? "");
  const hasAutofilledRef = useRef(false);

  useEffect(() => {
    if (isEdit || rebookFrom) return;
    if (phoneNumber.trim().length < 7) {
      hasAutofilledRef.current = false;
      return;
    }
    if (hasAutofilledRef.current) return;

    const timer = setTimeout(async () => {
      const result = await lookupCustomerByPhone(phoneNumber.trim());
      if (!result) return;
      hasAutofilledRef.current = true;
      if (result.customerName) setCustomerName(result.customerName);
      if (result.serviceId) setServiceId(result.serviceId);
      if (result.staffName) setStaffName(result.staffName);
      if (result.numberOfPeople > 1) setNumberOfPeople(result.numberOfPeople);
      toast.info("Auto-filled from previous booking");
    }, 500);
    return () => clearTimeout(timer);
  }, [phoneNumber, isEdit, rebookFrom]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const { hour, minute } = parseTimeString(timeValue);

    const data = {
      branchId: selectedBranch,
      date: selectedDate,
      hour,
      minute,
      numberOfPeople: numberOfPeople || 1,
      phoneNumber: phoneNumber.trim(),
      serviceId,
      customerName: customerName.trim() || undefined,
      staffName: staffName.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateAppointment(editAppointment.id, data)
        : await createAppointment(data);

      if (result.success) {
        toast.success(isEdit ? "Appointment updated" : "Appointment created");
        onSuccess();
      } else {
        setError(result.error ?? "Something went wrong");
      }
    });
  }

  const minTime = toTimeString(branch?.openingHour ?? 7, 0);
  const maxTime = toTimeString(branch?.closingHour ?? 19, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="98XXXXXXXX"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Customer Name</Label>
        <Input
          id="name"
          placeholder="Optional"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="time">Time *</Label>
        <Input
          id="time"
          type="time"
          min={minTime}
          max={maxTime}
          value={timeValue}
          onChange={(e) => setTimeValue(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Service *</Label>
        <Select value={serviceId} onValueChange={(v) => { if (v !== null) setServiceId(v); }} required>
          <SelectTrigger>
            <SelectValue placeholder="Select service" />
          </SelectTrigger>
          <SelectContent>
            {services.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} — Rs.{s.price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="numberOfPeople">Number of People *</Label>
        <Input
          id="numberOfPeople"
          type="number"
          min="1"
          max="50"
          value={numberOfPeople}
          onChange={(e) => setNumberOfPeople(e.target.value === "" ? "" : Number(e.target.value))}
          onBlur={() => { if (!numberOfPeople || numberOfPeople < 1) setNumberOfPeople(1); }}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="staff">Staff / Technician</Label>
        <Input
          id="staff"
          placeholder="Optional"
          value={staffName}
          onChange={(e) => setStaffName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          placeholder="Optional notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending || !serviceId || !phoneNumber.trim()}>
        {isPending ? "Saving..." : isEdit ? "Update Appointment" : "Book Appointment"}
      </Button>
    </form>
  );
}
