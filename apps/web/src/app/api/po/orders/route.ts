import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { audit } from '../../../../lib/log/mask'

const prisma = new PrismaClient()

const CreateSchema = z.object({
  number: z.string().min(3),
  tenantId: z.string().min(1),
  supplierId: z.string().min(1),
  currency: z.string().min(3).max(3).default('GBP'),
  expectedAt: z.coerce.date().optional(),
  lines: z.array(z.object({ lineNo: z.number().int().positive(), sku: z.string(), qty: z.coerce.number().positive(), price: z.coerce.number().nonnegative() })).min(1),
})

export async function GET() {
  const rows = await prisma.purchaseOrder.findMany({ include: { lines: true }, orderBy: { createdAt: 'desc' }, take: 50 })
  audit({ route: '/api/po/orders', action: 'list' })
  return NextResponse.json({ ok: true, status: 'active', data: rows })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = CreateSchema.parse(body)
    const created = await prisma.purchaseOrder.create({
      data: {
        number: parsed.number,
        tenantId: parsed.tenantId,
        supplierId: parsed.supplierId,
        currency: parsed.currency,
        expectedAt: parsed.expectedAt,
        lines: { create: parsed.lines },
      },
      include: { lines: true },
    })
    audit({ route: '/api/po/orders', action: 'create' })
    return NextResponse.json({ ok: true, status: 'created', data: created }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'invalid'
    return NextResponse.json({ ok: false, status: 'error', error: message }, { status: 400 })
  }
}


