import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ensureRoleAllowed, getRoleFromRequest } from '@/lib/rbac'

export async function POST(req: Request): Promise<NextResponse> {
  const role = getRoleFromRequest(req)
  const check = ensureRoleAllowed('pos', role)
  if (!check.ok) return NextResponse.json({ ok: false, error: 'access_denied' }, { status: 403 })

  const tenantId = 't1'
  const items = [
    { sku: 'SKU-001', name: 'Coffee 250ml', priceMinor: 250 },
    { sku: 'SKU-002', name: 'Sandwich', priceMinor: 450 },
    { sku: 'SKU-003', name: 'Cake Slice', priceMinor: 300 },
  ]

  for (const it of items) {
    const exists = await prisma.inventoryItem.findFirst({ where: { tenantId, sku: it.sku } })
    if (!exists) {
      await prisma.inventoryItem.create({ data: { tenantId, sku: it.sku, qtyOnHand: 100 as any } })
    }
  }
  return NextResponse.json({ ok: true, items })
}


