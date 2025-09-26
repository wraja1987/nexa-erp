import { NextResponse } from 'next/server'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../../lib/rbac'
import { prisma } from '../../../../../lib/db'
import { z } from 'zod'

const schema = z.object({
  tenantId: z.string().default('t1'),
  storeId: z.string(),
  cashierUserId: z.string(),
  sales: z.array(z.object({
    lines: z.array(z.object({ sku: z.string(), name: z.string(), qty: z.number().positive(), unitPriceMinor: z.number().int().nonnegative(), taxRate: z.number().min(0).max(1).default(0) })),
    totalMinor: z.number().int().nonnegative(),
  })),
})

export async function POST(req: Request) {
  const role = getRoleFromRequest(req)
  const check = ensureRoleAllowed('pos', role)
  if (!check.ok) return NextResponse.json({ ok: false, error: 'access_denied' }, { status: 403 })
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 })
  const { tenantId, storeId, cashierUserId, sales } = parsed.data

  const results = [] as string[]
  for (const s of sales) {
    const sale = await prisma.posSale.create({
      data: {
        tenantId,
        storeId,
        cashierUserId,
        saleNumber: `PARKED-${Date.now()}`,
        status: 'paid',
        subtotal: s.lines.reduce((a, l) => a + l.unitPriceMinor * l.qty, 0),
        tax: s.lines.reduce((a, l) => a + Math.round(l.unitPriceMinor * l.qty * l.taxRate), 0),
        total: s.totalMinor,
        currency: 'GBP',
        lines: {
          create: s.lines.map(l => ({ tenantId, sku: l.sku, name: l.name, qty: l.qty, unitPrice: l.unitPriceMinor, taxRate: l.taxRate, lineTotal: Math.round(l.unitPriceMinor * l.qty * (1 + l.taxRate)) })),
        },
      },
    })
    results.push(sale.id)
  }
  return NextResponse.json({ ok: true, reconciled: results.length, saleIds: results })
}



