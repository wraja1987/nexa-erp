import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../../lib/rbac'

export async function GET(req: Request): Promise<NextResponse> {
  const role = getRoleFromRequest(req)
  const check = ensureRoleAllowed('pos', role)
  if (!check.ok) return NextResponse.json({ ok: false, error: 'access_denied' }, { status: 403 })

  const url = new URL(req.url)
  const shiftId = url.searchParams.get('shiftId')
  if (!shiftId) return NextResponse.json({ ok: false, error: 'missing_shiftId' }, { status: 400 })

  const shift = await prisma.tillShift.findUnique({ where: { id: shiftId } })
  if (!shift) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })

  const sales = await prisma.posSale.findMany({ where: { shiftId } })
  const payments = await prisma.posPayment.findMany({ where: { saleId: { in: sales.map(s => s.id) } } })
  const refunds = await prisma.posRefund.findMany({ where: { saleId: { in: sales.map(s => s.id) } } })

  const toNum = (v: unknown) => Number(v || 0)
  const totals = {
    salesCount: sales.length,
    grossMinor: sales.reduce((a, s) => a + Number(s.total), 0),
    paymentsMinor: payments.reduce((a, p) => a + Number(p.amount), 0),
    refundsMinor: refunds.reduce((a, r) => a + Number(r.amount), 0),
    cashMinor: payments.filter(p => p.method === 'cash').reduce((a, p) => a + Number(p.amount), 0),
    cardMinor: payments.filter(p => p.method === 'card').reduce((a, p) => a + Number(p.amount), 0),
    varianceMinor: toNum(shift.closingFloat) - toNum(shift.openingFloat) - payments.filter(p => p.method === 'cash').reduce((a, p) => a + Number(p.amount), 0),
  }
  return NextResponse.json({ ok: true, shift, totals })
}



