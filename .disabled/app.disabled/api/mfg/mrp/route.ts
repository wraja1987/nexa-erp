import { NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'
import { z } from 'zod'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../lib/rbac'
import { audit } from '../../../../lib/log/mask'
import { withCorrelation } from '../../../../lib/logger'
import { parseBody } from '../../../../lib/api/parseBody'

const prisma = new PrismaClient()

const GenerateSchema = z.object({
  tenantId: z.string().min(1),
  itemCode: z.string().min(1).default('SKU-ABC'),
  planDate: z.coerce.date().default(() => new Date()),
  suggestedQty: z.coerce.number().positive().default(10),
})

export async function GET(req: Request) {
  const corr = withCorrelation()
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('manufacturing', role)
    if (!guard.ok) return NextResponse.json({ ok: false, code: 'access_denied', message: 'Forbidden' }, { status: 403 })
    const rows = await prisma.mrpPlan.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
    audit({ route: '/api/mfg/mrp', action: 'list', count: rows.length })
    return NextResponse.json({ ok: true, data: rows, ...corr })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/mfg/mrp', action: 'error', message })
    return NextResponse.json({ ok: false, code: 'bad_request', message, ...corr }, { status: 400 })
  }
}

export async function POST(req: Request) {
  const corr = withCorrelation()
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('manufacturing', role)
    if (!guard.ok) return NextResponse.json({ ok: false, code: 'access_denied', message: 'Forbidden' }, { status: 403 })
    const raw = (await parseBody(req)) as any
    raw.tenantId = raw.tenantId || req.headers.get('x-tenant-id') || 't1'
    const body = GenerateSchema.parse(raw)
    const created = await prisma.mrpPlan.create({
      data: {
        tenantId: body.tenantId,
        itemCode: body.itemCode,
        planDate: body.planDate,
        suggestedQty: new Prisma.Decimal(body.suggestedQty),
        recommendation: 'make',
      },
    })
    audit({ route: '/api/mfg/mrp', action: 'generate', itemCode: body.itemCode, qty: body.suggestedQty })
    return NextResponse.json({ ok: true, data: created, ...corr }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/mfg/mrp', action: 'error', message })
    return NextResponse.json({ ok: false, code: 'bad_request', message, ...corr }, { status: 400 })
  }
}


