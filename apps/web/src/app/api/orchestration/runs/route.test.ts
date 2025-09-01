import { describe, it, expect } from 'vitest'
import { GET, POST } from './route'
import { clearQueue, enqueueOrchestration } from '../../../../lib/orchestration/runner'

describe('orchestration runs API', () => {
  it('lists queued runs', async () => {
    clearQueue()
    enqueueOrchestration({ wf: 'demo' })
    const res = (await GET()) as Response
    const json = (await res.json()) as { items: Array<{ id: string; enqueuedAt: string; status: string }> }
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
    const after = (await (await GET()).json()) as { items: Array<{ id: string; status: string }> }
    expect(after.items[0].status).toBe('completed')
  })
})


