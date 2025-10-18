import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const PWD = 'Wolfish123';

async function ensureColumns() {
  // Add columns only if they do not exist; keep existing data intact
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'password_hash'
      ) THEN
        ALTER TABLE "User" ADD COLUMN password_hash TEXT;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'role'
      ) THEN
        ALTER TABLE "User" ADD COLUMN role TEXT DEFAULT 'admin';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'is_active'
      ) THEN
        ALTER TABLE "User" ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
      END IF;

      -- Make sure email is unique so upsert works
      IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname='public' AND indexname='user_email_unique_idx'
      ) THEN
        CREATE UNIQUE INDEX user_email_unique_idx ON "User"(email);
      END IF;
    END
    $$;
  `);
}

async function upsertUser(email: string, role: string) {
  const hash = await bcrypt.hash(PWD, 12);
  await prisma.$executeRawUnsafe(
    `
    INSERT INTO "User"(email, password_hash, role, is_active)
    VALUES ($1, $2, $3, TRUE)
    ON CONFLICT (email)
    DO UPDATE SET password_hash = EXCLUDED.password_hash,
                  role = EXCLUDED.role,
                  is_active = TRUE;
    `,
    email, hash, role
  );
  console.log('✓ ensured user:', email, 'role=', role);
}

(async () => {
  try {
    await ensureColumns();
    await upsertUser('info@nexaai.co.uk', 'super_admin');
    await upsertUser('wraja1987@gmail.com', 'admin');
  } finally {
    await prisma.$disconnect();
  }
})();
