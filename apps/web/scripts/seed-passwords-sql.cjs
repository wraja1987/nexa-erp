const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
require('dotenv').config({ path: path.resolve(process.cwd(), 'apps/web/.env') });
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL missing. Add it to repo .env or apps/web/.env');
  process.exit(1);
}

(async () => {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='User' AND column_name='password_hash'
        ) THEN
          ALTER TABLE "User" ADD COLUMN password_hash TEXT;
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='User' AND column_name='role'
        ) THEN
          ALTER TABLE "User" ADD COLUMN role TEXT DEFAULT 'admin';
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='User' AND column_name='is_active'
        ) THEN
          ALTER TABLE "User" ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='user_email_unique_idx'
        ) THEN
          CREATE UNIQUE INDEX user_email_unique_idx ON "User"(email);
        END IF;
      END
      $$;
    `);

    const idCol = await client.query(`
      SELECT column_default FROM information_schema.columns
      WHERE table_schema='public' AND table_name='User' AND column_name='id'
    `);
    const hasId = idCol.rowCount > 0;
    const hasIdDefault = hasId && idCol.rows[0].column_default != null;

    async function upsert(email, role) {
      const hash = await bcrypt.hash('Wolfish123', 12);
      if (hasId && !hasIdDefault) {
        const id = randomUUID();
        await client.query(
          `INSERT INTO "User"(id, email, password_hash, role, is_active)
           VALUES ($1, $2, $3, $4, TRUE)
           ON CONFLICT (email)
           DO UPDATE SET password_hash = EXCLUDED.password_hash,
                         role = EXCLUDED.role,
                         is_active = TRUE;`,
          [id, email, hash, role]
        );
      } else {
        await client.query(
          `INSERT INTO "User"(email, password_hash, role, is_active)
           VALUES ($1, $2, $3, TRUE)
           ON CONFLICT (email)
           DO UPDATE SET password_hash = EXCLUDED.password_hash,
                         role = EXCLUDED.role,
                         is_active = TRUE;`,
          [email, hash, role]
        );
      }
      console.log('✓ ensured user:', email, 'role=', role);
    }

    await upsert('info@nexaai.co.uk', 'super_admin');
    await upsert('wraja1987@gmail.com', 'admin');
    console.log('✅ Seeded users with password: Wolfish123');
  } finally {
    await client.end();
  }
})().catch((e) => { console.error(e); process.exit(1); });
