import { describe, it, expect, vi } from 'vitest'
import { NexaClient } from './index'

describe('NexaClient', () => {
  it('calls assistant API with auth header when apiKey provided', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch' as any).mockResolvedValue({ ok: true, json: async () => ({ ok: true }) } as any)
    const client = new NexaClient({ baseUrl: 'http://localhost:3000', apiKey: 'k' })
    const res = await client.assistant({ route: '/x' })
    expect(res.ok).toBe(true)
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://localhost:3000/api/assistant')
    expect((init.headers as any).authorization).toBe('Bearer k')
    fetchSpy.mockRestore()
  })

  it('throws on non-ok responses', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch' as any).mockResolvedValue({ ok: false, status: 500 } as any)
    const client = new NexaClient({ baseUrl: 'http://l' })
    await expect(client.assistant({ route: '/x' })).rejects.toThrow('assistant error: 500')
    fetchSpy.mockRestore()
  })
})



