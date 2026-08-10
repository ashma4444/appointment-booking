import { prisma } from "@/lib/prisma";
import { ServiceList } from "@/components/services/service-list";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });

  return (
    <div className="p-4">
      <ServiceList services={services} />
    </div>
  );
}
