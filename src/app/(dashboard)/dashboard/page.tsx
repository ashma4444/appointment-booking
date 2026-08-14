import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { DEFAULT_MAX_PER_HOUR, formatHour, formatTime, getStatusColor, getStatusLabel } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import { BranchDateBar } from "@/components/layout/branch-date-bar";
import { Suspense } from "react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string; date?: string }>;
}) {
  const params = await searchParams;
  const today = format(new Date(), "yyyy-MM-dd");
  const selectedDate = params.date || today;

  const branches = await prisma.branch.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const selectedBranch = params.branch || branches[0]?.id || "";

  const branch = branches.find((b) => b.id === selectedBranch);
  if (!branch) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">No branches configured.</p>
      </div>
    );
  }

  const [capacity, appointments] = await Promise.all([
    prisma.dailyCapacity.findUnique({
      where: { branchId_date: { branchId: selectedBranch, date: selectedDate } },
    }),
    prisma.appointment.findMany({
      where: { branchId: selectedBranch, date: selectedDate },
      include: { service: true },
      orderBy: [{ hour: "asc" }, { minute: "asc" }, { createdAt: "asc" }],
    }),
  ]);
  const maxPerHour = capacity?.maxPerHour ?? DEFAULT_MAX_PER_HOUR;

  // Single-pass status counting + grouping by hour
  const statusCounts: Record<string, number> = {};
  const byHour: Record<number, typeof appointments> = {};
  for (const apt of appointments) {
    statusCounts[apt.status] = (statusCounts[apt.status] ?? 0) + 1;
    if (apt.status !== "cancelled") {
      (byHour[apt.hour] ??= []).push(apt);
    }
  }
  const nonCancelledCount = appointments.length - (statusCounts["cancelled"] ?? 0);
  const confirmed = statusCounts["confirmed"] ?? 0;
  const completed = statusCounts["completed"] ?? 0;
  const noShow = statusCounts["no_show"] ?? 0;
  const cancelled = statusCounts["cancelled"] ?? 0;

  const hourSlots = [];
  for (let h = branch.openingHour; h <= branch.closingHour; h++) {
    const slotAppts = byHour[h] ?? [];
    hourSlots.push({
      hour: h,
      count: slotAppts.reduce((sum, a) => sum + a.numberOfPeople, 0),
      appointments: slotAppts,
    });
  }

  return (
    <>
      <Suspense>
        <BranchDateBar branches={branches} />
      </Suspense>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{nonCancelledCount}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{confirmed}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{noShow}</p>
                <p className="text-xs text-muted-foreground">No Show</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Capacity info */}
        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {branch.name} &mdash; Max {maxPerHour}/hour
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            {hourSlots.map((slot) => {
              const pct = maxPerHour > 0 ? (slot.count / maxPerHour) * 100 : 0;
              const isFull = slot.count >= maxPerHour;
              return (
                <div key={slot.hour} className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground w-16 shrink-0">
                      {formatHour(slot.hour)}
                    </span>
                    <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull
                            ? "bg-red-400"
                            : pct >= 70
                              ? "bg-amber-400"
                              : pct > 0
                                ? "bg-emerald-400"
                                : ""
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs font-medium tabular-nums">
                        {slot.count}/{maxPerHour}
                      </span>
                      {isFull && (
                        <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
                          FULL
                        </Badge>
                      )}
                    </div>
                  </div>
                  {slot.appointments.length > 0 && (
                    <div className="ml-[76px] space-y-0.5">
                      {slot.appointments.map((apt) => (
                        <div key={apt.id} className="flex items-center gap-1.5 text-[11px]">
                          <span className="font-mono text-muted-foreground shrink-0">
                            {formatTime(apt.hour, apt.minute)}
                          </span>
                          <span className="truncate">
                            {apt.customerName || apt.phoneNumber}
                          </span>
                          {apt.numberOfPeople > 1 && (
                            <span className="text-muted-foreground shrink-0">
                              ×{apt.numberOfPeople}
                            </span>
                          )}
                          <Badge className={`text-[9px] h-3.5 px-1 ml-auto shrink-0 ${getStatusColor(apt.status)}`}>
                            {getStatusLabel(apt.status)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {hourSlots.length === 0 && (
              <p className="text-sm text-muted-foreground">No operating hours configured.</p>
            )}
          </CardContent>
        </Card>

        {/* Cancelled count if any */}
        {cancelled > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            {cancelled} cancelled appointment{cancelled > 1 ? "s" : ""} not shown
          </p>
        )}
      </div>
    </>
  );
}
