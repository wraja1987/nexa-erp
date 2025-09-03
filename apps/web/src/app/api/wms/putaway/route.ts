import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { audit } from '../../../../lib/log/mask'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../lib/rbac'
import { withCorrelation } from '../../../../lib/logger'

const prisma = new PrismaClient()

const Body = z.object({
  tenantId: z.string().min(1),
  itemSku: z.string().min(1),
  toLocationId: z.string().min(1).optional(),
  qty: z.coerce.number().positive(),
})

export async function POST(req: Request) {
  const corr = withCorrelation()
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('wms', role)
    if (!guard.ok) return NextResponse.json({ ok: false, code: 'access_denied', message: 'Forbidden' }, { status: 403 })
    const body = Body.parse(await req.json())
    // Find existing inventory for tenant+sku (location optional)
    const existing = await prisma.inventoryItem.findFirst({ where: { tenantId: body.tenantId, sku: body.itemSku } })
    let item
    if (existing) {
      item = await prisma.inventoryItem.update({
        where: { id: existing.id },
        data: { qtyOnHand: { increment: body.qty } },
      })
    } else {
      item = await prisma.inventoryItem.create({
        data: { tenantId: body.tenantId, sku: body.itemSku, qtyOnHand: body.qty },
      })
    }
    audit({ route: '/api/wms/putaway', action: 'put', sku: body.itemSku, qty: body.qty })
    return NextResponse.json({ ok: true, item, ...corr })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/wms/putaway', action: 'error', message })
    return NextResponse.json({ ok: false, code: 'bad_request', message, ...corr }, { status: 400 })
  }
}


