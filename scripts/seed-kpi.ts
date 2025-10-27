import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

(async () => {
  const tenantId = "root";
  const now = new Date();
  try {
    await prisma.kpiSnapshot.create({
      data: { tenantId, name: "revenue", value: 12500 as any, asOf: now },
    });
  } catch {}
  console.log("KPI seed done");
})().finally(() => prisma.$disconnect());




