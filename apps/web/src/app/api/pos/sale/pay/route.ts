import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ensureRoleAllowed, getRoleFromRequest } from '@/lib/rbac'
import { posAudit } from '@/lib/pos/audit'
import Stripe from 'stripe'

export async function POST(req: Request): Promise<NextResponse> {
  const role = getRoleFromRequest(req)
  const check = ensureRoleAllowed('pos', role)
  if (!check.ok) return NextResponse.json({ ok: false, error: 'access_denied' }, { status: 403 })

  const { saleId, method, amountMinor, stripePaymentIntentId } = await req.json().catch(()=>({})) as any
  if (!saleId || !method || typeof amountMinor !== 'number') {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })
  }

  const sale = await prisma.posSale.findUnique({ where: { id: saleId } })
  if (!sale) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })

  const payment = await prisma.posPayment.create({ data: { tenantId: sale.tenantId, saleId, method: method.toLowerCase(), amount: amountMinor } as any })
  if (method === 'CARD' && stripePaymentIntentId && process.env.STRIPE_SECRET_KEY) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
    const pi: any = await stripe.paymentIntents.retrieve(stripePaymentIntentId, { expand: ['charges'] } as any)
    const chargeId = pi?.charges?.data?.[0]?.id
    if (chargeId) {
      await prisma.posPayment.update({ where: { id: payment.id }, data: { stripeChargeId: chargeId } })
    }
  }

  await posAudit({ route: '/api/pos/sale/pay', action: 'pay', saleId, paymentId: payment.id, method })
  return NextResponse.json({ ok: true, payment })
}


