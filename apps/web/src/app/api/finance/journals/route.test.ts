import { describe, it, expect } from 'vitest'
import { POST } from './route'

describe('finance journals', () => {
  it('rejects unbalanced journal', async () => {
    const body = {
      tenantId: 't1',
      lines: [
        { accountId: 'acc1', debit: 100, credit: 0 },
        { accountId: 'acc2', debit: 0, credit: 50 },
      ],
    }
    const req = new Request('http://localhost/api/finance/journals', { method: 'POST', headers: { 'content-type': 'application/json', 'x-role': 'admin' }, body: JSON.stringify(body) })
    const res: any = await POST(req)
    const json: any = await res.json()
    expect(res.status).toBe(400)
    expect(json.ok).toBe(false)
    expect(json.code).toBe('unbalanced')
  })

  it('enforces RBAC (user cannot post)', async () => {
    const body = { tenantId: 't1', lines: [ { accountId: 'a', debit: 1, credit: 0 }, { accountId: 'b', debit: 0, credit: 1 } ] }
    const req = new Request('http://localhost/api/finance/journals', { method: 'POST', headers: { 'content-type': 'application/json', 'x-role': 'user' }, body: JSON.stringify(body) })
    const res: any = await POST(req)
    const json: any = await res.json()
    expect(res.status).toBe(403)
    expect(json.ok).toBe(false)
  })
})


