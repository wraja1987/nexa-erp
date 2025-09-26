import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../../lib/rbac'
import { posAudit } from '../../../../../lib/pos/audit'
import { z } from 'zod'

const schema = z.object({
  tenantId: z.string().default('t1'),
  shiftId: z.string(),
  closingFloatMinor: z.number().int().nonnegative().default(0),
})

export async function POST(req: Request): Promise<NextResponse> {
  const role = getRoleFromRequest(req)
  const check = ensureRoleAllowed('pos', role)
  if (!check.ok) return NextResponse.json({ ok: false, error: 'access_denied' }, { status: 403 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 })
  const { tenantId, shiftId, closingFloatMinor } = parsed.data

  const shift = await prisma.tillShift.update({
    where: { id: shiftId },
    data: { status: 'closed', closingFloat: closingFloatMinor, closedAt: new Date() },
  })

  await posAudit({ route: '/api/pos/shift/close', action: 'close', shiftId })
  return NextResponse.json({ ok: true, shift })
}



