"use client";

import { MoreVertical, CheckCircle2, XCircle, Ban, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getStatusColor, getStatusLabel } from "@/lib/constants";
import { updateAppointmentStatus, deleteAppointment } from "@/actions/appointment-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AppointmentWithService } from "@/types";

interface AppointmentCardProps {
  appointment: AppointmentWithService;
  onEdit: () => void;
}

export function AppointmentCard({ appointment, onEdit }: AppointmentCardProps) {
  const isCancelled = appointment.status === "cancelled";

  async function handleStatusChange(status: string) {
    const result = await updateAppointmentStatus(appointment.id, status);
    if (result.success) {
      toast.success(`Appointment marked as ${status.replace("_", " ")}`);
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete() {
    const result = await deleteAppointment(appointment.id);
    if (result.success) {
      toast.success("Appointment deleted");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
        isCancelled && "opacity-50 bg-muted/50"
      )}
    >
      <div className="flex-1 min-w-0" onClick={onEdit} role="button" tabIndex={0}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("font-medium truncate", isCancelled && "line-through")}>
            {appointment.customerName || appointment.phoneNumber}
          </span>
          <Badge variant="secondary" className="text-[10px] h-5 shrink-0">
            {appointment.service.name}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {appointment.customerName && (
            <span className="text-xs text-muted-foreground font-mono">
              {appointment.phoneNumber}
            </span>
          )}
          <Badge className={cn("text-[10px] h-4 px-1", getStatusColor(appointment.status))}>
            {getStatusLabel(appointment.status)}
          </Badge>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
          <MoreVertical className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
          <DropdownMenuSeparator />
          {appointment.status !== "completed" && (
            <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
              <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600" />
              Mark Completed
            </DropdownMenuItem>
          )}
          {appointment.status !== "no_show" && (
            <DropdownMenuItem onClick={() => handleStatusChange("no_show")}>
              <XCircle className="h-4 w-4 mr-2 text-red-600" />
              Mark No Show
            </DropdownMenuItem>
          )}
          {appointment.status !== "cancelled" && (
            <DropdownMenuItem onClick={() => handleStatusChange("cancelled")}>
              <Ban className="h-4 w-4 mr-2 text-gray-500" />
              Cancel
            </DropdownMenuItem>
          )}
          {appointment.status === "cancelled" && (
            <DropdownMenuItem onClick={() => handleStatusChange("confirmed")}>
              <CheckCircle2 className="h-4 w-4 mr-2 text-blue-600" />
              Reconfirm
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
