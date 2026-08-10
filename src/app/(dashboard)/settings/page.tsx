import { prisma } from "@/lib/prisma";
import { CapacityManager } from "@/components/settings/capacity-manager";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const branches = await prisma.branch.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });

  return (
    <div className="p-4">
      <CapacityManager branches={branches} />
    </div>
  );
}
