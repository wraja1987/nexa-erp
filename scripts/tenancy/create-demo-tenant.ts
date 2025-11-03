import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const DEMO_NAME = "Nexa Demo Tenant";
  const DEMO_SLUG = "nexa-demo";
  const DEMO_EMAIL = "demo@nexa.ai";
  const DEMO_ROLE: "SUPER_ADMIN" | "ADMIN" | "USER" = "ADMIN";
  const now = new Date();

  // Upsert demo tenant by slug
  const demo = await prisma.tenant.upsert({
    where: { slug: DEMO_SLUG },
    update: { name: DEMO_NAME, updatedAt: now as any },
    create: { name: DEMO_NAME, slug: DEMO_SLUG, createdAt: now as any, updatedAt: now as any },
  });

  // Upsert demo user by email, bind to tenant and ensure required fields
  await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {
      tenantId: demo.id,
      role: DEMO_ROLE,
      updatedAt: now as any,
    },
    create: {
      email: DEMO_EMAIL,
      role: DEMO_ROLE,
      tenantId: demo.id,
      createdAt: now as any,
      updatedAt: now as any,
      // If password or passwordHash is required by your schema, set a placeholder:
      // passwordHash: "$2b$10$dummydummydummydummyhash",
    },
  });

  console.log("DEMO TENANT COMPLETE");
}

main()
  .catch((err) => {
    console.error("FATAL", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
