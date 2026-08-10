"use client";

import { useState } from "react";
import { Plus, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ServiceDialog } from "./service-dialog";
import { toggleServiceActive } from "@/actions/service-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Service } from "@/generated/prisma/client";

export function ServiceList({ services }: { services: Service[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);

  function handleEdit(service: Service) {
    setEditService(service);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditService(null);
    setDialogOpen(true);
  }

  async function handleToggle(id: string, isActive: boolean) {
    const result = await toggleServiceActive(id, !isActive);
    if (result.success) {
      toast.success(isActive ? "Service deactivated" : "Service activated");
    } else {
      toast.error(result.error);
    }
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
    <div className="space-y-4">
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
              <Card key={service.id} className={cn(!service.isActive && "opacity-50")}>
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
                      {!service.isActive && (
                        <Badge variant="secondary" className="text-[10px] h-4">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => handleToggle(service.id, service.isActive)}
                  >
                    {service.isActive ? (
                      <ToggleRight className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => handleEdit(service)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
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
