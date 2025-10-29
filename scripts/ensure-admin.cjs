const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

(async () => {
  const prisma = new PrismaClient();
  try {
    const email = process.env.SEED_ADMIN_EMAIL || 'superadmin@nexa.local';
    const pwd   = process.env.SEED_ADMIN_PASSWORD || 'Test123!';
    const hash  = await bcrypt.hash(pwd, 10);

    // Ensure pgcrypto (for gen_random_uuid) exists
    try {
      await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    } catch {}

    // Try via Prisma model first (camelCase)
    let user = null;
    try {
      user = await prisma.user.findUnique({ where: { email } });
    } catch {}

    if (!user) {
      // Prefer Prisma create if your model maps camelCase fields
      let created = null;
      try {
        created = await prisma.user.create({
          data: {
            email,
            name: 'Super Admin',
            role: 'superadmin',
            active: true,
            passwordHash: hash, // if your Prisma model maps to password_hash
            tenantId: 'root',
          },
        });
        user = created;
      } catch {
        // Fallback for snake_case schema: explicitly set id using gen_random_uuid()
        await prisma.$executeRawUnsafe(
          `INSERT INTO "User" (id, email, name, role, active, password_hash, tenant_id)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
           ON CONFLICT (email) DO UPDATE SET
             name=EXCLUDED.name, role=EXCLUDED.role, active=EXCLUDED.active,
             password_hash=EXCLUDED.password_hash, tenant_id=EXCLUDED.tenant_id`,
          email, 'Super Admin', 'superadmin', true, hash, 'root'
        );
      }
    } else {
      // Make sure it's active and has the new password hash
      try {
        await prisma.user.update({
          where: { email },
          data: { active: true, role: user.role || 'superadmin', passwordHash: hash, tenantId: user.tenantId || 'root' },
        });
      } catch {
        await prisma.$executeRawUnsafe(
          `UPDATE "User"
             SET active=$1, role=$2, password_hash=$3, tenant_id=COALESCE(tenant_id,'root')
           WHERE email=$4`,
          true, 'superadmin', hash, email
        );
      }
    }

    console.log(`[seed] Super admin ready: ${email} / Test123!`);
  } catch (e) {
    console.error('[seed] error', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
