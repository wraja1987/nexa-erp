import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const tenantId = "nexa-root";
  await prisma.$executeRawUnsafe(
    `insert into "Tenant" (id, name, "createdAt", "updatedAt") values ($1, 'Nexa Root', now(), now()) on conflict (id) do nothing`,
    tenantId,
  );

  const email = "super@nexa.ai".toLowerCase();
  const passwordHash = bcrypt.hashSync("ChangeMe!123", 10);

  await prisma.user.upsert({
    where: { email },
    create: { email, role: "SUPER_ADMIN", active: true, tenant_id: tenantId, passwordHash },
    update: { role: "SUPER_ADMIN", active: true, tenant_id: tenantId, passwordHash },
  });

  console.log("Seeded SUPER_ADMIN:", email);
}

main().catch((e)=>{ console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());




