import { createClient } from "@libsql/client";
import { scryptSync, randomBytes } from "crypto";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  process.exit(1);
}

const client = createClient({ url, authToken });

const schema = [
  `CREATE TABLE IF NOT EXISTS "Branch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "openingHour" INTEGER NOT NULL DEFAULT 7,
    "closingHour" INTEGER NOT NULL DEFAULT 19,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Branch_name_key" ON "Branch"("name")`,

  `CREATE TABLE IF NOT EXISTS "DailyCapacity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "branchId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "maxPerHour" INTEGER NOT NULL DEFAULT 5,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyCapacity_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "DailyCapacity_branchId_date_key" ON "DailyCapacity"("branchId", "date")`,
  `CREATE INDEX IF NOT EXISTS "DailyCapacity_branchId_date_idx" ON "DailyCapacity"("branchId", "date")`,

  `CREATE TABLE IF NOT EXISTS "Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "duration" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "branchId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "hour" INTEGER NOT NULL,
    "minute" INTEGER NOT NULL DEFAULT 0,
    "numberOfPeople" INTEGER NOT NULL DEFAULT 1,
    "customerName" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "staffName" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Appointment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "Appointment_branchId_date_idx" ON "Appointment"("branchId", "date")`,
  `CREATE INDEX IF NOT EXISTS "Appointment_branchId_date_hour_idx" ON "Appointment"("branchId", "date", "hour")`,
  `CREATE INDEX IF NOT EXISTS "Appointment_phoneNumber_idx" ON "Appointment"("phoneNumber")`,
  `CREATE INDEX IF NOT EXISTS "Appointment_status_idx" ON "Appointment"("status")`,
  `CREATE INDEX IF NOT EXISTS "Appointment_status_date_idx" ON "Appointment"("status", "date")`,

  `CREATE TABLE IF NOT EXISTS "AppSettings" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
  )`,
];

// Migrations for columns added after initial deployment
const migrations = [
  `ALTER TABLE "Appointment" ADD COLUMN "minute" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "Appointment" ADD COLUMN "numberOfPeople" INTEGER NOT NULL DEFAULT 1`,
];

async function main() {
  console.log("Pushing schema to Turso...");

  for (const sql of schema) {
    try {
      await client.execute(sql);
      const tableName = sql.match(/"(\w+)"/)?.[1] || "index";
      console.log(`  ✓ ${tableName}`);
    } catch (e) {
      console.error(`  ✗ Failed:`, (e as Error).message);
    }
  }

  console.log("\nRunning migrations...");
  for (const sql of migrations) {
    try {
      await client.execute(sql);
      const col = sql.match(/ADD COLUMN "(\w+)"/)?.[1] || "unknown";
      console.log(`  ✓ Added column: ${col}`);
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.includes("duplicate")) {
        const col = sql.match(/ADD COLUMN "(\w+)"/)?.[1] || "unknown";
        console.log(`  ~ Already exists: ${col}`);
      } else {
        console.error(`  ✗ Failed:`, msg);
      }
    }
  }

  console.log("\nSeeding data...");

  const now = new Date().toISOString();

  // Seed branches
  await client.execute({
    sql: `INSERT OR IGNORE INTO "Branch" ("id", "name", "address", "phone", "openingHour", "closingHour", "isActive", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: ["ason", "Ason", "Ason, Kathmandu", "+977-01-4234567", 7, 19, true, now, now],
  });
  await client.execute({
    sql: `INSERT OR IGNORE INTO "Branch" ("id", "name", "address", "phone", "openingHour", "closingHour", "isActive", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: ["khusibu", "Khusibu", "Khusibu, Kathmandu", "+977-01-4345678", 7, 19, true, now, now],
  });
  console.log("  ✓ Branches seeded");

  // Seed services
  const services = [
    { id: "gel-nail", name: "Gel Nail", category: "nails", price: 800, duration: 45 },
    { id: "nail-extension", name: "Nail Extension", category: "nails", price: 1500, duration: 60 },
    { id: "nail-art", name: "Nail Art", category: "nails", price: 500, duration: 30 },
    { id: "manicure", name: "Manicure", category: "nails", price: 600, duration: 40 },
    { id: "lash-extension", name: "Lash Extension", category: "lashes", price: 2500, duration: 90 },
    { id: "lash-lift", name: "Lash Lift", category: "lashes", price: 1500, duration: 60 },
    { id: "classic-lash", name: "Classic Lash", category: "lashes", price: 2000, duration: 75 },
    { id: "volume-lash", name: "Volume Lash", category: "lashes", price: 3500, duration: 120 },
  ];

  for (const s of services) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO "Service" ("id", "name", "category", "price", "duration", "isActive", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [s.id, s.name, s.category, s.price, s.duration, true, now, now],
    });
  }
  console.log("  ✓ Services seeded");

  // Seed default PIN (12345)
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync("12345", salt, 64).toString("hex");
  const pinHash = `${salt}:${hash}`;
  await client.execute({
    sql: `INSERT OR IGNORE INTO "AppSettings" ("key", "value", "updatedAt") VALUES (?, ?, ?)`,
    args: ["pinHash", pinHash, now],
  });
  console.log("  ✓ Default PIN seeded");

  console.log("\nDone! Turso database is ready.");
}

main().catch(console.error);
