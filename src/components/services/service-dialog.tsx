"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { createService, updateService } from "@/actions/service-actions";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";
import type { Service } from "@/generated/prisma/client";

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editService: Service | null;
}

export function ServiceDialog({ open, onOpenChange, editService }: ServiceDialogProps) {
  const isEdit = !!editService;

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(editService?.name ?? "");
  const [category, setCategory] = useState(editService?.category ?? "nails");
  const [price, setPrice] = useState(String(editService?.price ?? ""));
  const [duration, setDuration] = useState(String(editService?.duration ?? ""));

  // Reset form when editService changes
  if (editService && name !== editService.name) {
    setName(editService.name);
    setCategory(editService.category);
    setPrice(String(editService.price));
    setDuration(String(editService.duration));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const data = {
      name: name.trim(),
      category,
      price: Number(price),
      duration: Number(duration),
      isActive: true,
    };

    const result = isEdit
      ? await updateService(editService.id, data)
      : await createService(data);

    setLoading(false);

    if (result.success) {
      toast.success(isEdit ? "Service updated" : "Service created");
      onOpenChange(false);
      setName("");
      setPrice("");
      setDuration("");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto rounded-t-2xl">
        <SheetHeader className="pb-4">
          <SheetTitle>{isEdit ? "Edit Service" : "New Service"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pb-6">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              placeholder="e.g. Gel Nail"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={category} onValueChange={(v) => { if (v !== null) setCategory(v); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Price (Rs.) *</Label>
              <Input
                type="number"
                placeholder="800"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Duration (min) *</Label>
              <Input
                type="number"
                placeholder="45"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                min="1"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !name.trim()}>
            {loading ? "Saving..." : isEdit ? "Update Service" : "Add Service"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
