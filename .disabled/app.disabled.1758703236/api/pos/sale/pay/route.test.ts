import { expect, test } from 'vitest'
import { POST } from './route'

test('sale pay validates request body', async () => {
  const req = new Request('http://localhost/api/pos/sale/pay', { method: 'POST', headers: { 'content-type': 'application/json', 'x-role': 'user' }, body: JSON.stringify({}) })
  const res: any = await POST(req)
  expect(res.status).toBe(400)
})


