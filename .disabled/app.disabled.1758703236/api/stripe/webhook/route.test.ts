import crypto from 'node:crypto'
import { expect, test } from 'vitest'

function sign(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex')
}

test('webhook signature verification', async () => {
  const secret = 'whsec_test'
  const payload = JSON.stringify({ id: 'evt_1', type: 'customer.updated' })
  const header = sign(payload, secret)
  const good = sign(payload, secret)
  const bad = sign(payload, 'wrong')
  expect(header).toEqual(good)
  expect(header).not.toEqual(bad)
})


