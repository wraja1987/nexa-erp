import { describe, it, expect } from 'vitest'
import { GET, POST } from './route'

describe('VAT MTD stubs', () => {
  it('requires admin for status', async () => {
    const req = new Request('http://localhost/api/tax/vat/mtd', { headers: { 'x-role': 'user' } })
    const res: any = await GET(req)
    expect(res.status).toBe(403)
  })
  it('requires admin for submit', async () => {
    const req = new Request('http://localhost/api/tax/vat/mtd', { method: 'POST', headers: { 'x-role': 'user' } })
    const res: any = await POST(req)
    expect(res.status).toBe(403)
  })
})






