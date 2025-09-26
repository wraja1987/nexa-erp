import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { prisma } from '@/lib/db'
import { posAudit } from '@/lib/pos/audit'

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  // Simple HMAC SHA-256 verification (Stripe CLI compatible when using signing secret as key)
  const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature))
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET_POS || process.env.STRIPE_WEBHOOK_SECRET || ''
  if (!secret) {
    await posAudit({ route: '/api/pos/stripe/webhook', status: 'not_configured' })
    return NextResponse.json({ ok: false, status: 'not_configured' }, { status: 200 })
  }

  const raw = await req.text()
  const sig = req.headers.get('stripe-signature') || ''
  const ok = verifySignature(raw, sig, secret)
  if (!ok) return NextResponse.json({ ok: false, status: 'invalid_signature' }, { status: 400 })

  const evt = JSON.parse(raw)
  const type: string = evt?.type || 'unknown'
  const id: string = evt?.id || 'evt_unknown'

  // Idempotency: use PosEvent.type keyed by event id
  const idemType = `pos_stripe_webhook:${id}`
  const exists = await prisma.posEvent.findFirst({ where: { type: idemType } })
  if (exists) {
    await posAudit({ route: '/api/pos/stripe/webhook', eventType: type, status: 'duplicate_ignored' })
    return NextResponse.json({ ok: true, status: 'duplicate' })
  }

  // Persist raw webhook receipt (masked)
  await prisma.webhookEvent.create({
    data: {
      source: 'stripe',
      eventId: id,
      eventType: type,
      receivedAt: new Date(),
      endpointId: 'pos_stripe_webhook',
      status: 'received',
      payload: { id, type },
    },
  })

  // Reconcile POS payments best-effort
  try {
    if (type === 'payment_intent.succeeded') {
      const pi = evt.data?.object
      const paymentIntentId = String(pi?.id || '')
      if (paymentIntentId) {
        const pay = await prisma.posPayment.findFirst({ where: { stripePaymentIntentId: paymentIntentId } })
        if (pay) {
          await prisma.posSale.update({ where: { id: pay.saleId }, data: { status: 'paid' } })
          await prisma.posEvent.create({ data: { tenantId: pay.tenantId, saleId: pay.saleId, type: idemType, payload: { id, type } } })
        }
      }
    } else if (type === 'payment_intent.payment_failed') {
      const pi = evt.data?.object
      const paymentIntentId = String(pi?.id || '')
      if (paymentIntentId) {
        const pay = await prisma.posPayment.findFirst({ where: { stripePaymentIntentId: paymentIntentId } })
        if (pay) {
          await prisma.posEvent.create({ data: { tenantId: pay.tenantId, saleId: pay.saleId, type: idemType, payload: { id, type } } })
        }
      }
    } else if (type === 'charge.refunded') {
      const charge = evt.data?.object
      const chargeId = String(charge?.id || '')
      if (chargeId) {
        const pay = await prisma.posPayment.findFirst({ where: { stripeChargeId: chargeId } })
        if (pay) {
          await prisma.posSale.update({ where: { id: pay.saleId }, data: { status: 'refunded' } })
          await prisma.posEvent.create({ data: { tenantId: pay.tenantId, saleId: pay.saleId, type: idemType, payload: { id, type } } })
        }
      }
    }
  } catch {}

  await posAudit({ route: '/api/pos/stripe/webhook', eventType: type })
  return NextResponse.json({ ok: true, status: 'processed' })
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'


