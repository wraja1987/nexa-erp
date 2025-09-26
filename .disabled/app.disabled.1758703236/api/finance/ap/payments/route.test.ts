import { describe, it, expect } from 'vitest'
import { POST } from './route'

describe('AP payments', () => {
  it('enforces RBAC', async () => {
    const req = new Request('http://localhost/api/finance/ap/payments', { method: 'POST', headers: { 'content-type': 'application/json', 'x-role': 'user' }, body: JSON.stringify({}) })
    const res: any = await POST(req)
    expect(res.status).toBe(403)
  })
})






