"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ServiceDialog } from "./service-dialog";
import { deleteService } from "@/actions/service-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Service } from "@/generated/prisma/client";

export function ServiceList({ services }: { services: Service[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleEdit(service: Service) {
    setEditService(service);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditService(null);
    setDialogOpen(true);
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteService(id);
      if (result.success) {
        toast.success("Service deleted");
      } else {
        toast.error(result.error);
      }
    });
  }

  const categoryLabels: Record<string, string> = {
    nails: "Nails",
    lashes: "Lashes",
    combo: "Combo",
    other: "Other",
  };

  const grouped = services.reduce<Record<string, Service[]>>((acc, s) => {
    const key = s.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <div className={cn("space-y-4", isPending && "opacity-60 pointer-events-none")}>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Services</h2>
        <Button size="sm" className="h-8 gap-1.5 rounded-full" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {categoryLabels[category] || category}
          </h3>
          <div className="space-y-2">
            {items.map((service) => (
              <Card key={service.id}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{service.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        Rs.{service.price}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {service.duration}min
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => handleEdit(service)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-destructive"
                    onClick={() => handleDelete(service.id, service.name)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {services.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No services yet. Add your first service.
        </p>
      )}

      <ServiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editService={editService}
      />
    </div>
  );
}
