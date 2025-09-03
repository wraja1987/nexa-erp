import { describe, it, expect } from 'vitest'
import { GET } from './route'

describe('trial balance', () => {
  it('requires admin role', async () => {
    const req = new Request('http://localhost/api/finance/trial-balance?tenantId=t1', { headers: { 'x-role': 'user' } })
    const res: any = await GET(req)
    const json: any = await res.json()
    expect(res.status).toBe(403)
    expect(json.ok).toBe(false)
  })
})


