import { describe, it, expect } from 'vitest'
import { GET, POST } from './route'
import { clearQueue, enqueueOrchestration } from '../../../../lib/orchestration/runner'

describe('orchestration runs API', () => {
  it('lists queued runs', async () => {
    clearQueue()
    enqueueOrchestration({ wf: 'demo' })
    const res = (await GET(new Request('http://localhost/api/orchestration/runs'))) as Response
    const json = (await res.json()) as { items: Array<{ id: string; enqueuedAt: string; status: string }>; total: number; page: number; pageSize: number }
    expect(json.items.length).toBe(1)
    expect(json.items[0].id).toMatch(/^orc_/)
    expect(json.items[0].status).toBe('queued')
  })
  it('completes a run via POST', async () => {
    clearQueue()
    const id = enqueueOrchestration({ wf: 'demo2' })
    const res = (await POST(new Request('http://localhost/api/orchestration/runs', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id })
    }))) as Response
    expect(res.ok).toBe(true)
    const after = (await (await GET(new Request('http://localhost/api/orchestration/runs?status=completed'))).json()) as { items: Array<{ id: string; status: string }>; total: number }
    expect(after.items[0].status).toBe('completed')
  })
  it('rejects missing id', async () => {
    const res = await POST(new Request('http://localhost/api/orchestration/runs', { method: 'POST', body: JSON.stringify({}) }))
    expect(res.status).toBe(400)
  })
  it('returns 404 for unknown id', async () => {
    const res = await POST(new Request('http://localhost/api/orchestration/runs', { method: 'POST', body: JSON.stringify({ id: 'orc_missing' }) }))
    expect(res.status).toBe(404)
  })
})


