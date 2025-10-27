import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function main() {
  const superEmail = process.env.SUPER_ADMIN_EMAIL!;
  const superPassword = process.env.SUPER_ADMIN_PASSWORD!;
  const adminEmail = process.env.ADMIN_EMAIL!;
  const adminPassword = process.env.ADMIN_PASSWORD!;
  const tenantCode = process.env.TENANT_CODE || 'NEXA_DEMO';
  const tenantName = process.env.TENANT_NAME || 'Nexa Demo Ltd';
  const tenant = await prisma.tenant.upsert({
    where: { code: tenantCode }, update: { name: tenantName }, create: { code: tenantCode, name: tenantName }
  });
  const superHash = await bcrypt.hash(superPassword, 12);
  const adminHash  = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: superEmail },
    update: { role: 'SUPER_ADMIN', password: superHash, tenantId: null },
    create: { email: superEmail, role: 'SUPER_ADMIN', password: superHash, tenantId: null },
  });
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN', password: adminHash, tenantId: tenant.id },
    create: { email: adminEmail, role: 'ADMIN', password: adminHash, tenantId: tenant.id },
  });
  console.log(JSON.stringify({ tenant }, null, 2));
}
main().catch(e => { console.error(e); process.exit(1); });
