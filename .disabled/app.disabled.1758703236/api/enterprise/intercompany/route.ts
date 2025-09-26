import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { audit } from '../../../../lib/log/mask'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../lib/rbac'

const prisma = new PrismaClient()

const CreateSchema = z.object({
  fromEntityId: z.string().min(1),
  toEntityId: z.string().min(1),
  ref: z.string().min(3),
  amount: z.coerce.number(),
  currency: z.string().min(3).max(3).default('GBP'),
})

export async function GET() {
  const rows = await prisma.intercompanyTxn.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
  audit({ route: '/api/enterprise/intercompany', action: 'list' })
  return NextResponse.json({ ok: true, status: 'active', data: rows })
}

export async function POST(req: Request) {
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('enterprise', role)
    if (!guard.ok) return NextResponse.json({ ok: false, status: 'access_denied' }, { status: 403 })
    const data = CreateSchema.parse(await req.json())
    const created = await prisma.intercompanyTxn.create({ data: {
      fromEntityId: data.fromEntityId,
      toEntityId: data.toEntityId,
      ref: data.ref,
      amount: data.amount,
      currency: data.currency,
    } })
    audit({ route: '/api/enterprise/intercompany', action: 'create' })
    return NextResponse.json({ ok: true, status: 'created', data: created }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'invalid'
    return NextResponse.json({ ok: false, status: 'error', error: message }, { status: 400 })
  }
}


