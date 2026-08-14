"use client";

import { useState, useTransition } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { getDataStats, deleteOldAppointments, deleteAllAppointments } from "@/actions/cleanup-actions";
import { getTodayAD } from "@/lib/nepali-date";
import { toast } from "sonner";

type ConfirmAction = "old" | "all" | null;

export function DataCleanup({ initialStats }: { initialStats: { appointmentCount: number; capacityCount: number } }) {
  const [isPending, startTransition] = useTransition();
  const [stats, setStats] = useState(initialStats);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  function handleConfirm() {
    if (confirmAction === "old") {
      const today = getTodayAD();
      startTransition(async () => {
        const result = await deleteOldAppointments(today);
        setConfirmAction(null);
        if (result.success) {
          toast.success(`Deleted ${result.deleted} old appointments`);
          getDataStats().then(setStats);
        } else {
          toast.error(result.error);
        }
      });
    } else if (confirmAction === "all") {
      startTransition(async () => {
        const result = await deleteAllAppointments();
        setConfirmAction(null);
        if (result.success) {
          toast.success(`Deleted ${result.deleted} appointments and all capacity data`);
          getDataStats().then(setStats);
        } else {
          toast.error(result.error);
        }
      });
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Data Cleanup</h2>

      <Card>
        <CardHeader className="pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-medium">Database Usage</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.appointmentCount}</p>
              <p className="text-xs text-muted-foreground">Appointments</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.capacityCount}</p>
              <p className="text-xs text-muted-foreground">Capacity Records</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-medium">Clean Up Old Data</CardTitle>
          <p className="text-xs text-muted-foreground">
            Remove past appointments to keep your database clean. Default capacity (5/hour) stays after cleanup.
          </p>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => setConfirmAction("old")}
            disabled={isPending}
          >
            <Trash2 className="h-4 w-4" />
            {isPending ? "Deleting..." : "Delete Past Appointments"}
          </Button>

          <Button
            variant="destructive"
            className="w-full gap-2"
            onClick={() => setConfirmAction("all")}
            disabled={isPending}
          >
            <Trash2 className="h-4 w-4" />
            {isPending ? "Deleting..." : "Delete All Data"}
          </Button>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={confirmAction !== null} onOpenChange={(open) => { if (!open) setConfirmAction(null); }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <DialogTitle>
                {confirmAction === "all" ? "Delete All Data?" : "Delete Past Appointments?"}
              </DialogTitle>
            </div>
            <DialogDescription>
              {confirmAction === "all"
                ? "This will permanently delete all appointments and capacity overrides. Default capacity (5/hour) will still apply. This cannot be undone."
                : "This will permanently delete all appointments before today and their capacity overrides. Today's and future appointments will not be affected."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
              {isPending ? "Deleting..." : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
