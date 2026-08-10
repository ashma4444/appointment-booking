"use client";

import { useState } from "react";
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
import { createAppointment, updateAppointment } from "@/actions/appointment-actions";
import { formatHour } from "@/lib/constants";
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
  onSuccess: () => void;
}

export function AppointmentForm({
  services,
  branches,
  selectedBranch,
  selectedDate,
  defaultHour,
  editAppointment,
  onSuccess,
}: AppointmentFormProps) {
  const branch = branches.find((b) => b.id === selectedBranch);
  const isEdit = !!editAppointment;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [phoneNumber, setPhoneNumber] = useState(editAppointment?.phoneNumber ?? "");
  const [customerName, setCustomerName] = useState(editAppointment?.customerName ?? "");
  const [serviceId, setServiceId] = useState(editAppointment?.serviceId ?? "");
  const [hour, setHour] = useState<number>(
    editAppointment?.hour ?? defaultHour ?? branch?.openingHour ?? 10
  );
  const [staffName, setStaffName] = useState(editAppointment?.staffName ?? "");
  const [notes, setNotes] = useState(editAppointment?.notes ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const data = {
      branchId: selectedBranch,
      date: selectedDate,
      hour,
      phoneNumber: phoneNumber.trim(),
      serviceId,
      customerName: customerName.trim() || undefined,
      staffName: staffName.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    const result = isEdit
      ? await updateAppointment(editAppointment.id, data)
      : await createAppointment(data);

    setLoading(false);

    if (result.success) {
      toast.success(isEdit ? "Appointment updated" : "Appointment created");
      onSuccess();
    } else {
      setError(result.error ?? "Something went wrong");
    }
  }

  const hours: number[] = [];
  if (branch) {
    for (let h = branch.openingHour; h < branch.closingHour; h++) {
      hours.push(h);
    }
  }

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
        <Label>Time *</Label>
        <Select value={String(hour)} onValueChange={(v) => { if (v !== null) setHour(Number(v)); }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {hours.map((h) => (
              <SelectItem key={h} value={String(h)}>
                {formatHour(h)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      <Button type="submit" className="w-full" disabled={loading || !serviceId || !phoneNumber.trim()}>
        {loading ? "Saving..." : isEdit ? "Update Appointment" : "Book Appointment"}
      </Button>
    </form>
  );
}
