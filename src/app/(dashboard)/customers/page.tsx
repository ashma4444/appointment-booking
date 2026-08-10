import { prisma } from "@/lib/prisma";
import { CustomerSearch } from "@/components/customers/customer-search";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || "";

  let appointments: Awaited<ReturnType<typeof prisma.appointment.findMany<{ include: { service: true; branch: true } }>>> = [];

  if (query.length >= 2) {
    appointments = await prisma.appointment.findMany({
      where: {
        OR: [
          { phoneNumber: { contains: query } },
          { customerName: { contains: query } },
        ],
      },
      include: { service: true, branch: true },
      orderBy: { date: "desc" },
      take: 100,
    });
  }

  return (
    <div className="p-4">
      <CustomerSearch query={query} appointments={appointments} />
    </div>
  );
}
