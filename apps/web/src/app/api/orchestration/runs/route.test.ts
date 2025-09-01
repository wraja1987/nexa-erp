import { describe, it, expect } from 'vitest'
import { GET } from './route'
import { clearQueue, enqueueOrchestration } from '../../../../lib/orchestration/runner'

describe('orchestration runs API', () => {
  it('lists queued runs', async () => {
    clearQueue()
    enqueueOrchestration({ wf: 'demo' })
    const res = (await GET()) as Response
    const json = (await res.json()) as { items: Array<{ id: string; enqueuedAt: string }> }
    expect(json.items.length).toBe(1)
    expect(json.items[0].id).toMatch(/^orc_/)
  })
})


