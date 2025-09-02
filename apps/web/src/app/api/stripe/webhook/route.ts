import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { PrismaClient } from '@prisma/client'
import { audit } from '../../../../../lib/log/mask'

const prisma = new PrismaClient()

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature))
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET || ''
  if (!secret) {
    audit({ route: '/api/stripe/webhook', status: 'not_configured' })
    return NextResponse.json({ ok: false, status: 'not_configured' })
  }
  const raw = await req.text()
  const sig = req.headers.get('stripe-signature') || ''
  const ok = verifySignature(raw, sig, secret)
  if (!ok) return NextResponse.json({ ok: false, status: 'invalid_signature' }, { status: 400 })
  const evt = JSON.parse(raw)
  const type = evt?.type || 'unknown'
  const id = evt?.id || 'unknown'
  await prisma.webhookEvent.create({ data: { source: 'stripe', eventId: id, type, receivedAt: new Date(), payload: evt } })
  audit({ route: '/api/stripe/webhook', eventType: type, hasMasked: true })
  return NextResponse.json({ ok: true, status: 'active' })
}

export const runtime = 'nodejs'

export const dynamic = 'force-dynamic'

