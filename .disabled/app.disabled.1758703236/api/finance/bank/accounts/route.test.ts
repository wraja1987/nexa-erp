import { describe, it, expect } from 'vitest'
import { GET } from './route'

describe('bank accounts', () => {
  it('enforces RBAC', async () => {
    const req = new Request('http://localhost/api/finance/bank/accounts?tenantId=t1', { headers: { 'x-role': 'user' } })
    const res: any = await GET(req)
    expect(res.status).toBe(403)
  })
})






