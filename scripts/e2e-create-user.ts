import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

async function main() {
  const email = process.env.NEXA_E2E_EMAIL!;
  const password = process.env.NEXA_E2E_PASSWORD!;
  const name = "E2E User";
  const prisma = new PrismaClient();
  const passwordField = "password_hash"; // matches prisma schema
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { [passwordField]: hashed, name },
    create: { email, name, [passwordField]: hashed },
  } as any);
  console.log("E2E user ready:", (user as any).id, (user as any).email);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });





