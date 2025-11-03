import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function GET() {
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
    `)

    const rows = await prisma.$queryRawUnsafe(`
      SELECT id, created_at, event, provider, account_id, user_id, email, error
      FROM public.auth_debug
      ORDER BY created_at DESC
      LIMIT 100
    `)

    return NextResponse.json(rows)
  } catch (e) {
    console.error('AUTH_DEBUG_DB_ERROR', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}


