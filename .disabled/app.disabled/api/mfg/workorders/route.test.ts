import { describe, it, expect } from 'vitest'
import { GET, POST } from './route'

describe('mfg workorders API', () => {
  it('lists work orders', async () => {
    const res = (await GET()) as Response
    const json = (await res.json()) as any
    expect(json.ok).toBe(true)
    expect(Array.isArray(json.data)).toBe(true)
  })
  it('creates a work order with valid payload', async () => {
    const uniqueNo = `WO-TEST-${Date.now()}`
    const req = new Request('http://localhost/api/mfg/workorders', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-role': 'admin' },
      body: JSON.stringify({ number: uniqueNo, tenantId: 'demo-tenant', itemCode: 'FG-100', quantity: 10 })
    })
    const res = (await POST(req)) as Response
    expect(res.status).toBe(201)
  })
})


