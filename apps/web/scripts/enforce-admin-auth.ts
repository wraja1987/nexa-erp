import 'dotenv/config';
import { randomUUID } from 'crypto';
import { Client } from 'pg';

const USERS = [
  { email: 'info@nexaai.co.uk',   role: 'super_admin' },
  { email: 'wraja1987@gmail.com', role: 'admin' },
];

(async () => {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL missing');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  for (const u of USERS) {
    await client.query(`
      INSERT INTO "User"(id, email) VALUES ($1,$2)
      ON CONFLICT (email) DO NOTHING
    `, [randomUUID(), u.email]);

    await client.query(`DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='role') THEN
        UPDATE "User" SET role = COALESCE(role, $1) WHERE email = $2;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='isActive') THEN
        UPDATE "User" SET "isActive" = TRUE WHERE email = $2;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='mustChangePassword') THEN
        UPDATE "User" SET "mustChangePassword" = TRUE WHERE email = $2;
      END IF;
    END $$;`, [u.role, u.email]);
  }

  await client.end();
  console.log('✅ Users enforced (idempotent).');
})().catch((e) => { console.error(e); process.exit(1); });



