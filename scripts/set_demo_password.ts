import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const EMAIL = process.env.NEXA_DEMO_EMAIL || "nexaaierp@gmail.com";
const PASSWORD = process.env.NEXA_DEMO_PASSWORD || "Wolfish123";

async function main() {
  const prisma = new PrismaClient();
  try {
    // Ensure a tenant exists; prefer the Nexa Demo tenant, create if missing
    const tenant =
      (await prisma.tenant.findFirst({ where: { name: "Nexa Demo" } })) ||
      (await prisma.tenant.create({ data: { name: "Nexa Demo" } }));

    await prisma.user.upsert({
      where: { email: EMAIL },
      update: {},
      create: { email: EMAIL, active: true, role: "owner", tenant_id: tenant.id },
      select: { id: true }
    });

    const hash = await bcrypt.hash(PASSWORD, 10);

    const columns: Array<"passwordHash" | "password"> = ["passwordHash", "password"];
    let setCol: "passwordHash" | "password" | null = null;

    for (const c of columns) {
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE "User" SET "${c}" = $1, "active" = true WHERE "email" = $2`,
          hash,
          EMAIL
        );
        setCol = c;
        break;
      } catch {
        // try next column
      }
    }

    if (!setCol) {
      console.log(
        JSON.stringify({ ok: false, email: EMAIL, reason: "No password/passwordHash column available after migration" })
      );
      return;
    }

    console.log(JSON.stringify({ ok: true, email: EMAIL, passwordSetOn: setCol }));
  } finally {
    // @ts-ignore
    await prisma.$disconnect?.();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


