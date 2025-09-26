import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../lib/rbac'
import { posAudit } from '../../../../lib/pos/audit'
import { z } from 'zod'

const lineSchema = z.object({
  sku: z.string(),
  name: z.string(),
  qty: z.number().positive(),
  unitPriceMinor: z.number().int().nonnegative(),
  taxRate: z.number().min(0).max(1).default(0),
})

const saleSchema = z.object({
  tenantId: z.string().default('t1'),
  storeId: z.string(),
  shiftId: z.string().optional(),
  cashierUserId: z.string(),
  currency: z.string().default('GBP'),
  lines: z.array(lineSchema).min(1),
})

export async function POST(req: Request): Promise<NextResponse> {
  const role = getRoleFromRequest(req)
  const check = ensureRoleAllowed('pos', role)
  if (!check.ok) return NextResponse.json({ ok: false, error: 'access_denied' }, { status: 403 })

  const body = await req.json().catch(() => null)
  const parsed = saleSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 })
  const { tenantId, storeId, shiftId, cashierUserId, currency, lines } = parsed.data

  // Compute totals (minor units)
  const subtotalMinor = lines.reduce((a, l) => a + l.unitPriceMinor * l.qty, 0)
  const taxMinor = lines.reduce((a, l) => a + Math.round(l.unitPriceMinor * l.qty * l.taxRate), 0)
  const totalMinor = subtotalMinor + taxMinor

  // Simple readable sale number
  const today = new Date()
  const ymd = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
  const store = await prisma.store.findFirst({ where: { id: storeId } })
  const storeCode = store?.code || 'MAIN'
  const count = await prisma.posSale.count({ where: { tenantId } })
  const saleNumber = `POS-${storeCode}-${ymd}-${String(count + 1).padStart(4, '0')}`

  const sale = await prisma.posSale.create({
    data: {
      tenantId,
      storeId,
      shiftId,
      cashierUserId,
      saleNumber,
      status: 'open',
      subtotal: subtotalMinor,
      tax: taxMinor,
      total: totalMinor,
      currency,
      lines: {
        create: lines.map(l => ({
          tenantId,
          sku: l.sku,
          name: l.name,
          qty: l.qty,
          unitPrice: l.unitPriceMinor,
          taxRate: l.taxRate,
          lineTotal: Math.round(l.unitPriceMinor * l.qty * (1 + l.taxRate)),
        })),
      },
    },
    include: { lines: true },
  })

  await posAudit({ route: '/api/pos/sale', action: 'create', saleId: sale.id, total: totalMinor })
  return NextResponse.json({ ok: true, sale })
}



