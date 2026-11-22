import fs from "fs";
import path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../.env") });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function runBackup() {
  console.log("Starting database backup...");
  const backupDir = path.join(__dirname, "../backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const tables: Array<keyof PrismaClient> = [
    "user" as any,
    "session" as any,
    "account" as any,
    "verification" as any,
    "category" as any,
    "event" as any,
    "banner" as any,
    "participation" as any,
    "ticket" as any,
    "invitation" as any,
    "payment" as any,
    "review" as any,
    "auditLog" as any,
    "notification" as any,
  ];

  const backupData: Record<string, any[]> = {};

  for (const table of tables) {
    if ((prisma as any)[table]) {
      const records = await (prisma as any)[table].findMany();
      backupData[table as string] = records;
      console.log(`- ${String(table)}: ${records.length} records`);
    }
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `db_backup_${timestamp}.json`;
  const filePath = path.join(backupDir, filename);

  fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), "utf8");
  console.log(`\n✅ Database backup successfully saved to: ${filePath}`);
}

runBackup()
  .catch((err) => {
    console.error("Backup failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
