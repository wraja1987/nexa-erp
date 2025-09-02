import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { audit } from '../../../../lib/log/mask'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../lib/rbac'

const prisma = new PrismaClient()

const CreateSchema = z.object({
  number: z.string().min(3),
  tenantId: z.string().min(1),
  itemCode: z.string().min(1),
  quantity: z.coerce.number().positive(),
  startPlanned: z.coerce.date().optional(),
  endPlanned: z.coerce.date().optional(),
})

export async function GET() {
  const items = await prisma.workOrder.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
  audit({ route: '/api/mfg/workorders', action: 'list' })
  return NextResponse.json({ ok: true, status: 'active', data: items })
}

export async function POST(req: Request) {
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('manufacturing', role)
    if (!guard.ok) {
      return NextResponse.json({ ok: false, status: 'access_denied' }, { status: 403 })
    }
    const body = await req.json()
    const parsed = CreateSchema.parse(body)
    const created = await prisma.workOrder.create({
      data: {
        number: parsed.number,
        tenantId: parsed.tenantId,
        itemCode: parsed.itemCode,
        quantity: parsed.quantity,
        startPlanned: parsed.startPlanned,
        endPlanned: parsed.endPlanned,
      },
    })
    audit({ route: '/api/mfg/workorders', action: 'create' })
    return NextResponse.json({ ok: true, status: 'created', data: created }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'invalid'
    return NextResponse.json({ ok: false, status: 'error', error: message }, { status: 400 })
  }
}


