import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
/**
 * Upsert users with bcrypt-hashed passwords.
 * Tries 'passwordHash' then 'hashedPassword' to match your model.
 * Adds 'role' if present in your schema; ignored otherwise.
 */
async function upsertUser(prisma: PrismaClient, email: string, plain: string, name: string, role: string) {
  const hashed = await bcrypt.hash(plain, 10);
  const candidates = ["passwordHash", "hashedPassword", "password_hash"];
  let lastError: unknown = null;
  for (const field of candidates) {
    try {
      const data: any = { email, name };
      data[field] = hashed;
      (data as any).role = role;
      const user = await (prisma as any).user.upsert({
        where: { email },
        update: data,
        create: data,
      });
      console.log(`User upserted via '${field}':`, user.email);
      return;
    } catch (e) {
      lastError = e;
    }
  }
  console.error(`Failed to upsert ${email}. Last error:`, lastError);
  process.exit(1);
}
async function main() {
  const prisma = new PrismaClient();
  await upsertUser(prisma, process.env.NEXA_SUPER_EMAIL!, process.env.NEXA_SUPER_PASSWORD!, "Super Admin", "SUPER_ADMIN");
  await upsertUser(prisma, process.env.NEXA_ADMIN_EMAIL!, process.env.NEXA_ADMIN_PASSWORD!, "Admin", "ADMIN");
  await prisma.$disconnect();
  console.log("Seeder complete.");
}
main().catch((e)=>{console.error(e);process.exit(1);});




