import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../../../lib/rbac'
import { audit } from '../../../../../../lib/log/mask'
import { withCorrelation } from '../../../../../../lib/logger'

const prisma = new PrismaClient()

const CreateBody = z.object({ tenantId: z.string().min(1), number: z.string().min(1), customerId: z.string().min(1), currency: z.string().default('GBP'), total: z.coerce.number().nonnegative() })

export async function GET(req: Request) {
  const corr = withCorrelation()
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('enterprise', role)
    if (!guard.ok) return NextResponse.json({ ok: false, code: 403, message: 'Forbidden', ...corr }, { status: 403 })
    const url = new URL(req.url)
    const tenantId = url.searchParams.get('tenantId') || 't1'
    const items = await prisma.customerInvoice.findMany({ where: { tenantId } })
    return NextResponse.json({ ok: true, items, ...corr })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/finance/ar/invoices', module: 'finance', action: 'error', message })
    return NextResponse.json({ ok: false, code: 'bad_request', message, ...corr }, { status: 400 })
  }
}

export async function POST(req: Request) {
  const corr = withCorrelation()
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('enterprise', role)
    if (!guard.ok) return NextResponse.json({ ok: false, code: 403, message: 'Forbidden', ...corr }, { status: 403 })
    const raw = await req.json().catch(async () => { const t = await req.text(); return JSON.parse(t || '{}') })
    const body = CreateBody.parse(raw)
    const created = await prisma.customerInvoice.create({ data: body })
    audit({ route: '/api/finance/ar/invoices', module: 'finance', action: 'AR_INVOICE_CREATE', status: 'ok', number: created.number })
    return NextResponse.json({ ok: true, item: created, ...corr })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/finance/ar/invoices', module: 'finance', action: 'AR_INVOICE_CREATE', status: 'error', message })
    return NextResponse.json({ ok: false, code: 'bad_request', message, ...corr }, { status: 400 })
  }
}


