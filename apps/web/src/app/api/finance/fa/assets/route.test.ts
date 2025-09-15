import { describe, it, expect } from 'vitest'
import { GET, POST } from './route'

describe('fixed assets', () => {
  it('enforces RBAC', async () => {
    const req = new Request('http://localhost/api/finance/fa/assets?tenantId=t1', { headers: { 'x-role': 'user' } })
    const res: any = await GET(req)
    expect(res.status).toBe(403)
  })
  it('creates an asset', async () => {
    const body = { tenantId: 't1', assetCode: 'FA-001', name: 'Lathe', category: 'Machinery', cost: 12000, salvage: 1000, usefulLifeM: 60, acquiredAt: new Date().toISOString() }
    const req = new Request('http://localhost/api/finance/fa/assets', { method: 'POST', headers: { 'content-type': 'application/json', 'x-role': 'admin' }, body: JSON.stringify(body) })
    const res: any = await POST(req)
    expect(res.status).toBe(201)
  })
})






