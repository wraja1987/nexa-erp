'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function writeAuthDebug(entry: {
  event: string;
  provider?: string | null;
  accountId?: string | null;
  userId?: string | null;
  email?: string | null;
  error?: string | null;
  raw?: any;
}) {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public.auth_debug (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at timestamptz DEFAULT now(),
        event text,
        provider text,
        account_id text,
        user_id text,
        email text,
        error text,
        raw jsonb
      )
    `);
  } catch (_e) {
    // ignore
  }

  const rawJson = entry.raw ? JSON.stringify(entry.raw) : null;

  await prisma.$executeRawUnsafe(
    `
    INSERT INTO public.auth_debug (event, provider, account_id, user_id, email, error, raw)
    VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
    `,
    entry.event || null,
    entry.provider || null,
    entry.accountId || null,
    entry.userId || null,
    entry.email || null,
    entry.error || null,
    rawJson
  );
}




