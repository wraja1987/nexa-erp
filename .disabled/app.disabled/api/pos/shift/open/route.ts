import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../../lib/rbac'
import { posAudit } from '../../../../../lib/pos/audit'
import { z } from 'zod'

const schema = z.object({
  tenantId: z.string().default('t1'),
  storeId: z.string(),
  openedByUserId: z.string(),
  openingFloatMinor: z.number().int().nonnegative().default(0),
})

export async function POST(req: Request): Promise<NextResponse> {
  const role = getRoleFromRequest(req)
  const check = ensureRoleAllowed('pos', role)
  if (!check.ok) return NextResponse.json({ ok: false, error: 'access_denied' }, { status: 403 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 })
  const { tenantId, storeId, openedByUserId, openingFloatMinor } = parsed.data

  const shift = await prisma.tillShift.create({
    data: {
      tenantId,
      storeId,
      openedByUserId,
      openedAt: new Date(),
      openingFloat: openingFloatMinor,
      status: 'open',
    },
  })

  await posAudit({ route: '/api/pos/shift/open', action: 'open', shiftId: shift.id })
  return NextResponse.json({ ok: true, shift })
}



