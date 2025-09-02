import { describe, it, expect } from 'vitest'
import { GET, POST } from './route'

describe('po orders API', () => {
  it('lists POs', async () => {
    const res = (await GET()) as Response
    const json = (await res.json()) as any
    expect(json.ok).toBe(true)
    expect(Array.isArray(json.data)).toBe(true)
  })
  it('rejects invalid create', async () => {
    const bad = new Request('http://localhost/api/po/orders', { method: 'POST', headers: { 'content-type': 'application/json', 'x-role': 'admin' }, body: JSON.stringify({}) })
    const res = (await POST(bad)) as Response
    expect(res.status).toBe(400)
  })
})


