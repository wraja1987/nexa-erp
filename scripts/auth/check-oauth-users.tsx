import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function dumpUser(email: string) {
  const rows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT id,
           email,
           role,
           active,
           tenant_id,
           "tenantId",
           password_hash,
           "passwordHash",
           created_at,
           "createdAt",
           updated_at,
           "updatedAt"
    FROM "public"."User"
    WHERE email = $1
    LIMIT 1;
  `, email);
  console.log('---', email, '---');
  console.log(JSON.stringify(rows, null, 2));
}

async function main() {
  await dumpUser('demo.admin@nexa.ai');
  await dumpUser('info@nexaai.co.uk');
  await dumpUser('wraja1987@gmail.com');
}
main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
