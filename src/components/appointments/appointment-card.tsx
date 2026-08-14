"use client";

import { useTransition, memo } from "react";
import { MoreVertical, CheckCircle2, XCircle, Ban, Trash2, ArrowRightLeft, Pencil, Copy, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getStatusColor, getStatusLabel, formatTime } from "@/lib/constants";
import { updateAppointmentStatus, deleteAppointment, moveAppointmentBranch } from "@/actions/appointment-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AppointmentWithService } from "@/types";
import type { Branch } from "@/generated/prisma/client";

interface AppointmentCardProps {
  appointment: AppointmentWithService;
  branches: Branch[];
  selectedBranch: string;
  onEdit: () => void;
  onRebook: () => void;
}

export const AppointmentCard = memo(function AppointmentCard({ appointment, branches, selectedBranch, onEdit, onRebook }: AppointmentCardProps) {
  const [isPending, startTransition] = useTransition();
  const isCancelled = appointment.status === "cancelled";

  function handleStatusChange(status: string) {
    startTransition(async () => {
      const result = await updateAppointmentStatus(appointment.id, status);
      if (result.success) {
        toast.success(`Appointment marked as ${status.replace("_", " ")}`);
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleMove(targetBranchId: string, targetBranchName: string) {
    startTransition(async () => {
      const result = await moveAppointmentBranch(appointment.id, targetBranchId);
      if (result.success) {
        toast.success(`Moved to ${targetBranchName}`);
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAppointment(appointment.id);
      if (result.success) {
        toast.success("Appointment deleted");
      } else {
        toast.error(result.error);
      }
    });
  }

  function copyToClipboard(text: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    toast.success("Phone number copied");
  }

  function handleCopyPhone(e: React.MouseEvent) {
    e.stopPropagation();
    copyToClipboard(appointment.phoneNumber);
  }

  const otherBranches = branches.filter((b) => b.id !== selectedBranch);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
        isCancelled && "opacity-50 bg-muted/50",
        isPending && "opacity-60 pointer-events-none"
      )}
    >
      <div className="flex-1 min-w-0" onClick={onEdit} role="button" tabIndex={0}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-mono shrink-0">
            {formatTime(appointment.hour, appointment.minute)}
          </span>
          <span className={cn("font-medium truncate", isCancelled && "line-through")}>
            {appointment.customerName || appointment.phoneNumber}
          </span>
          <Badge variant="secondary" className="text-[10px] h-5 shrink-0">
            {appointment.service.name}
          </Badge>
          {appointment.numberOfPeople > 1 && (
            <Badge variant="outline" className="text-[10px] h-5 shrink-0">
              {appointment.numberOfPeople} people
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {appointment.customerName && (
            <span
              className="text-xs text-muted-foreground font-mono hover:text-foreground cursor-pointer active:scale-95 transition-all"
              onClick={handleCopyPhone}
              title="Tap to copy"
            >
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
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onRebook}>
            <RefreshCw className="h-4 w-4 mr-2 text-violet-600" />
            Book Again
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => copyToClipboard(appointment.phoneNumber)}>
            <Copy className="h-4 w-4 mr-2 text-sky-600" />
            Copy Phone
          </DropdownMenuItem>
          {otherBranches.map((b) => (
            <DropdownMenuItem key={b.id} onClick={() => handleMove(b.id, b.name)}>
              <ArrowRightLeft className="h-4 w-4 mr-2 text-indigo-600" />
              Move to {b.name}
            </DropdownMenuItem>
          ))}
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
});
