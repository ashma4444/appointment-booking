import { prisma } from "@/lib/prisma";
import { CapacityManager } from "@/components/settings/capacity-manager";
import { DataCleanup } from "@/components/settings/data-cleanup";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [branches, appointmentCount, capacityCount] = await Promise.all([
    prisma.branch.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.appointment.count(),
    prisma.dailyCapacity.count(),
  ]);

  return (
    <div className="p-4 space-y-6">
      <CapacityManager branches={branches} />
      <DataCleanup initialStats={{ appointmentCount, capacityCount }} />
    </div>
  );
}
