const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  const tenantId = "root";
  const now = new Date();
  try {
    await prisma.kpiSnapshot.create({
      data: { tenantId, name: "revenue", value: 12500, asOf: now },
    });
    console.log("KPI seed created");
  } catch (e) {
    console.log("KPI seed skipped:", e && e.code ? e.code : "");
  } finally {
    await prisma.$disconnect();
  }
})();


