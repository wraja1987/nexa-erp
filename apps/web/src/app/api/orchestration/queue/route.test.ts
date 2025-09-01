import { describe, it, expect } from 'vitest'
import { GET } from './route'
import { clearQueue, enqueueOrchestration } from '../../../../lib/orchestration/runner'

describe('orchestration queue API', () => {
  it('returns queued count', async () => {
    clearQueue()
    enqueueOrchestration({ wf: 'x' })
    const res = await GET()
    const body = await (res as Response).json()
    expect(body.queued).toBe(1)
  })
})


