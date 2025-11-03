import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "public"."User" ADD COLUMN IF NOT EXISTS "passwordHash" text;
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "public"."User" ADD COLUMN IF NOT EXISTS "tenantId" text;
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "public"."User" ADD COLUMN IF NOT EXISTS "createdAt" timestamp;
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "public"."User" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp;
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE "public"."User" SET "passwordHash" = "password_hash" WHERE "password_hash" IS NOT NULL;
  `);
  await prisma.$executeRawUnsafe(`
    UPDATE "public"."User" SET "tenantId" = tenant_id WHERE tenant_id IS NOT NULL;
  `);
  await prisma.$executeRawUnsafe(`
    UPDATE "public"."User" SET "createdAt" = created_at WHERE created_at IS NOT NULL;
  `);
  await prisma.$executeRawUnsafe(`
    UPDATE "public"."User" SET "updatedAt" = updated_at WHERE updated_at IS NOT NULL;
  `);

  console.log('patched user columns');
}
main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
