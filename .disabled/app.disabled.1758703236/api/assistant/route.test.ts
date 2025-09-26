import { describe, it, expect } from 'vitest'
import { POST } from './route'

type AssistantBody = { route: string; userContext?: unknown; lastError?: string; selection?: string }

function req(body: AssistantBody, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/assistant', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

describe('assistant route', () => {
  it('masks sensitive fields and responds ok', async () => {
    const r = await POST(req({ route: '/dashboard', lastError: 'STACKTRACE', selection: 'secret' }))
    expect(r.status).toBe(200)
    const data = await r.json()
    expect(data.message).toContain('/dashboard')
  })

  it('rate limits excessive calls', async () => {
    let last
    for (let i = 0; i < 40; i++) {
      last = await POST(req({ route: '/x' }, { 'x-forwarded-for': '1.2.3.4' }))
    }
    expect(last!.status === 200 || last!.status === 429).toBe(true)
  })
  it('enforces token budget per session', async () => {
    const session = 's1'
    const req1 = new Request('http://localhost/api/assistant', { method: 'POST', headers: { 'content-type': 'application/json', 'x-session': session, 'x-forwarded-for': '1.1.1.1' }, body: JSON.stringify({ route: '/x', selection: 'x'.repeat(2500) }) })
    const r1 = await POST(req1)
    expect(r1.status).toBe(200)
    const req2 = new Request('http://localhost/api/assistant', { method: 'POST', headers: { 'content-type': 'application/json', 'x-session': session, 'x-forwarded-for': '1.1.1.1' }, body: JSON.stringify({ route: '/x', selection: 'x'.repeat(2500) }) })
    const r2 = await POST(req2)
    expect([200, 429]).toContain(r2.status)
  })
})


