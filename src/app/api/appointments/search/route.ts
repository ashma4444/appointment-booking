import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q") || "";
  const branchId = searchParams.get("branch");

  if (query.length < 2) {
    return NextResponse.json({ appointments: [] });
  }

  const where: Record<string, unknown> = {
    OR: [
      { customerName: { contains: query } },
      { phoneNumber: { contains: query } },
    ],
  };
  if (branchId) where.branchId = branchId;

  const appointments = await prisma.appointment.findMany({
    where,
    include: { service: true, branch: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ appointments });
}
