import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const ason = await prisma.branch.upsert({
    where: { name: "Ason" },
    update: {},
    create: {
      name: "Ason",
      address: "Ason, Kathmandu",
      phone: "+977-01-4234567",
      openingHour: 10,
      closingHour: 19,
    },
  });

  const khusibu = await prisma.branch.upsert({
    where: { name: "Khusibu" },
    update: {},
    create: {
      name: "Khusibu",
      address: "Khusibu, Kathmandu",
      phone: "+977-01-4345678",
      openingHour: 10,
      closingHour: 19,
    },
  });

  console.log("Branches seeded:", ason.name, khusibu.name);

  const services = [
    { name: "Gel Nail", category: "nails", price: 800, duration: 45 },
    { name: "Nail Extension", category: "nails", price: 1500, duration: 60 },
    { name: "Nail Art", category: "nails", price: 500, duration: 30 },
    { name: "Manicure", category: "nails", price: 600, duration: 40 },
    { name: "Lash Extension", category: "lashes", price: 2500, duration: 90 },
    { name: "Lash Lift", category: "lashes", price: 1500, duration: 60 },
    { name: "Classic Lash", category: "lashes", price: 2000, duration: 75 },
    { name: "Volume Lash", category: "lashes", price: 3500, duration: 120 },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.name.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: {
        id: service.name.toLowerCase().replace(/\s+/g, "-"),
        ...service,
      },
    });
  }

  console.log("Services seeded:", services.length);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
