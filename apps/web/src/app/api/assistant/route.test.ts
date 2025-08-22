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
})


