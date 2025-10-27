/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

async function main() {
  const prisma = new PrismaClient();
  try {
    const email = process.env.E2E_EMAIL;
    const password = process.env.E2E_PASSWORD;
    if (!email || !password) throw new Error("E2E_EMAIL/E2E_PASSWORD required");
    const hashed = await hash(password, 12);
    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase() },
      update: { passwordHash: hashed, active: true },
      create: {
        tenant_id: "seed-tenant",
        email: email.toLowerCase(),
        role: "ADMIN",
        active: true,
        passwordHash: hashed,
      },
    });
    console.log("Seeded user:", user.email);
  } finally {
    await new Promise((r) => setTimeout(r, 10));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });


