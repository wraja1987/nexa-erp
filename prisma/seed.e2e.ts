import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const email = process.env.E2E_EMAIL || "wraja1987@gmail.com";
const plain = process.env.E2E_PASSWORD || "ChangeMe!123";

async function main() {
  const passwordHash = await bcrypt.hash(plain, 12);
  await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    create: {
      tenant_id: "root",
      email: email.toLowerCase(),
      role: "ADMIN",
      name: "E2E Admin",
      passwordHash,
      active: true,
    },
    update: {
      name: "E2E Admin",
      passwordHash,
      active: true,
    },
  });
}

main().finally(() => prisma.$disconnect());






