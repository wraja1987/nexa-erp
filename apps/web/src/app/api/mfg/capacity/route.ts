import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../lib/rbac'
import { audit } from '../../../../lib/log/mask'
import { withCorrelation } from '../../../../lib/logger'
import { parseBody } from '../../../../lib/api/parseBody'

const prisma = new PrismaClient()

const Body = z.object({
  tenantId: z.string().min(1),
  resourceCode: z.string().min(1).default('RES-1'),
  date: z.coerce.date().default(() => new Date()),
  availableMins: z.coerce.number().int().nonnegative().default(480),
})

export async function GET(req: Request) {
  const corr = withCorrelation()
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('manufacturing', role)
    if (!guard.ok) return NextResponse.json({ ok: false, code: 'access_denied', message: 'Forbidden' }, { status: 403 })
    const rows = await prisma.capacityCalendar.findMany({ orderBy: { date: 'desc' }, take: 30 })
    audit({ route: '/api/mfg/capacity', action: 'list', count: rows.length })
    return NextResponse.json({ ok: true, data: rows, ...corr })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/mfg/capacity', action: 'error', message })
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
    const body = Body.parse(raw)
    const existing = await prisma.capacityCalendar.findFirst({ where: { tenantId: body.tenantId, resourceCode: body.resourceCode, date: body.date } })
    const row = existing
      ? await prisma.capacityCalendar.update({ where: { id: existing.id }, data: { availableMins: body.availableMins } })
      : await prisma.capacityCalendar.create({ data: { tenantId: body.tenantId, resourceCode: body.resourceCode, date: body.date, availableMins: body.availableMins } })
    audit({ route: '/api/mfg/capacity', action: 'upsert', resourceCode: body.resourceCode, mins: body.availableMins })
    return NextResponse.json({ ok: true, data: row, ...corr })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/mfg/capacity', action: 'error', message })
    return NextResponse.json({ ok: false, code: 'bad_request', message, ...corr }, { status: 400 })
  }
}


