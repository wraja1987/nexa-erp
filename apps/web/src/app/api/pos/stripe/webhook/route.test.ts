import crypto from 'node:crypto'
import { expect, test, vi, beforeEach } from 'vitest'
import * as db from '@/lib/db'
import { POST } from './route'

function sign(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex')
}

beforeEach(() => {
  // Minimal Prisma mocks for idempotency + reconciliation path
  // posEvent: first call returns null (no duplicate), second returns an object (duplicate)
  let called = false
  vi.spyOn(db, 'prisma', 'get').mockReturnValue({
    posEvent: {
      findFirst: vi.fn(async (q?: any) => {
        if (q?.where?.type) {
          if (!called) { called = true; return null }
          return { id: 'evt_log' }
        }
        return null
      }),
      create: vi.fn(async () => ({ id: 'evt_log' })),
    },
    webhookEvent: { create: vi.fn(async () => ({ id: 'wh_log' })) },
    posPayment: { findFirst: vi.fn(async () => null) },
    posSale: { update: vi.fn(async () => ({ id: 'sale1', status: 'paid' })) },
  } as unknown as db.PrismaClient)
})

test('pos stripe webhook signature verification and idempotency', async () => {
  const secret = 'whsec_test'
  process.env.STRIPE_WEBHOOK_SECRET = secret
  const payload = JSON.stringify({ id: 'evt_1', type: 'payment_intent.succeeded', data: { object: { id: 'pi_1', amount_received: 100 } } })
  const header = sign(payload, secret)
  const req = new Request('http://localhost/api/pos/stripe/webhook', { method: 'POST', headers: { 'stripe-signature': header }, body: payload })
  const res1: any = await POST(req)
  expect(await res1.json()).toMatchObject({ ok: true })
  const res2: any = await POST(new Request('http://localhost/api/pos/stripe/webhook', { method: 'POST', headers: { 'stripe-signature': header }, body: payload }))
  expect(await res2.json()).toMatchObject({ status: 'duplicate' })
})


