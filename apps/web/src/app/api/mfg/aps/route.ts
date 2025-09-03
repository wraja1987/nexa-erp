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
  workOrderNumber: z.string().min(1).default('WO-1'),
  startDate: z.coerce.date().default(() => new Date()),
  durationMins: z.coerce.number().int().positive().default(120),
})

export async function POST(req: Request) {
  const corr = withCorrelation()
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('manufacturing', role)
    if (!guard.ok) return NextResponse.json({ ok: false, code: 'access_denied', message: 'Forbidden' }, { status: 403 })
    const raw = (await parseBody(req)) as any
    raw.tenantId = raw.tenantId || req.headers.get('x-tenant-id') || 't1'
    const body = Body.parse(raw)
    const wo = await prisma.workOrder.upsert({
      where: { number: body.workOrderNumber },
      update: { startPlanned: body.startDate },
      create: { tenantId: body.tenantId, number: body.workOrderNumber, itemCode: 'SKU-ABC', quantity: 1, startPlanned: body.startDate },
    })
    await prisma.routingStep.create({ data: { workOrderId: wo.id, seq: 10, durationMins: body.durationMins, status: 'pending' } })
    audit({ route: '/api/mfg/aps', action: 'plan', wo: body.workOrderNumber, mins: body.durationMins })
    return NextResponse.json({ ok: true, workOrderId: wo.id, ...corr })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/mfg/aps', action: 'error', message })
    return NextResponse.json({ ok: false, code: 'bad_request', message, ...corr }, { status: 400 })
  }
}


