/* ensure-admin.cjs */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

(async () => {
  const email = "superadmin@nexa.local";
  const name = "Super Admin";
  const role = "superadmin";
  const tenantId = "root";
  const password = "Test123!";
  const hash = await bcrypt.hash(password, 10);

  const upsert = async () => {
    try {
      await prisma.user.upsert({
        where: { email },
        create: { email, name, role, tenantId, active: true, passwordHash: hash },
        update: { name, role, tenantId, active: true, passwordHash: hash },
      });
      return true;
    } catch (e) { return false; }
  };

  let ok = await upsert();
  if (!ok) {
    // Fallback for snake_case columns
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "User"(id, email, name, role, active, password_hash, tenant_id)
         VALUES (gen_random_uuid(), $1,$2,$3,$4,$5,$6)
         ON CONFLICT (email) DO UPDATE
         SET name=EXCLUDED.name, role=EXCLUDED.role, active=EXCLUDED.active,
             password_hash=EXCLUDED.password_hash, tenant_id=EXCLUDED.tenant_id`,
        email, name, role, true, hash, tenantId
      );
      ok = true;
    } catch (e) {
      console.error("[seed] fatal", e);
      process.exit(1);
    }
  }
  console.log(`[seed] Super admin ready: ${email} / ${password}`);
  await prisma.$disconnect();
})();
