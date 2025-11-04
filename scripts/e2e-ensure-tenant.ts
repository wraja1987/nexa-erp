import { PrismaClient } from "@prisma/client";
async function main() {
  const prisma = new PrismaClient();
  const email = process.env.NEXA_E2E_EMAIL!;
  const user = await (prisma as any).user.findUnique({ where: { email } });
  if (!user) { console.error("User not found:", email); process.exit(1); }
  let tenant = await (prisma as any).tenant.findFirst();
  if (!tenant) {
    try {
      tenant = await (prisma as any).tenant.create({ data: { name: "Default Tenant" } as any });
    } catch {
      tenant = await (prisma as any).tenant.create({ data: {} as any });
    }
  }
  await (prisma as any).user.update({ where: { id: user.id }, data: { tenantId: tenant.id } });
  await prisma.$disconnect();
  console.log("tenantId set on", email, "→", tenant.id);
}
main().catch(e=>{console.error(e);process.exit(1);});
