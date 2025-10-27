import { prisma } from "../apps/web/src/lib/prisma";
import { hash } from "bcryptjs";

async function main() {
  const email = process.env.E2E_EMAIL?.toLowerCase();
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) {
    throw new Error("E2E_EMAIL and E2E_PASSWORD must be set");
  }
  const hashed = await hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash: hashed, active: true },
    create: {
      tenant_id: "seed-tenant",
      email,
      role: "ADMIN",
      active: true,
      passwordHash: hashed,
    },
  });
  // eslint-disable-next-line no-console
  console.log("Seeded user:", user.email);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});








