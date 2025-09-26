import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../../lib/db'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../../lib/rbac'
import { audit } from '../../../../../lib/log/mask'
import { withCorrelation } from '../../../../../lib/logger'

const CreateBody = z.object({ tenantId: z.string().min(1), billId: z.string().min(1), amount: z.coerce.number().positive(), method: z.string().min(1), reference: z.string().optional() })

export async function POST(req: Request) {
  const corr = withCorrelation()
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('enterprise', role)
    if (!guard.ok) return NextResponse.json({ ok: false, code: 403, message: 'Forbidden', ...corr }, { status: 403 })
    const raw = await req.json().catch(async () => { const t = await req.text(); return JSON.parse(t || '{}') })
    const body = CreateBody.parse(raw)
    const bill = await prisma.supplierBill.findUniqueOrThrow({ where: { id: body.billId } })
    const pay = await prisma.supplierPayment.create({ data: body })
    const paidSum = await prisma.supplierPayment.aggregate({ where: { billId: body.billId }, _sum: { amount: true } })
    const paid = Number(paidSum._sum.amount || 0)
    const total = Number(bill.total)
    const status = paid >= total ? 'Paid' : paid > 0 ? 'PartPaid' : 'Approved'
    await prisma.supplierBill.update({ where: { id: bill.id }, data: { status } })
    audit({ route: '/api/finance/ap/payments', module: 'finance', action: 'AP_PAY', status: 'ok', billId: bill.id, amount: body.amount })
    return NextResponse.json({ ok: true, paymentId: pay.id, status, ...corr }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/finance/ap/payments', module: 'finance', action: 'AP_PAY', status: 'error', message })
    return NextResponse.json({ ok: false, code: 'bad_request', message, ...corr }, { status: 400 })
  }
}


