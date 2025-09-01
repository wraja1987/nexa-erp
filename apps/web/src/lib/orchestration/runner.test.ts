import { describe, it, expect, beforeEach } from 'vitest'
import { enqueueOrchestration, getQueueLength, clearQueue, getQueueSnapshot, completeRun, getRuns } from './runner'

describe('orchestration runner', () => {
  beforeEach(() => {
    clearQueue()
  })

  it('enqueues jobs and reports queue length', () => {
    expect(getQueueLength()).toBe(0)
    const id = enqueueOrchestration({ a: 1 })
    expect(id).toMatch(/^orc_/)
    expect(getQueueLength()).toBe(1)
  })

  it('exposes snapshot without payloads', () => {
    enqueueOrchestration({ secret: 'x' })
    const snap = getQueueSnapshot()
    expect(snap.length).toBe(1)
    expect((snap[0] as any).input).toBeUndefined()
  })

  it('completes a run and lists statuses', () => {
    const id = enqueueOrchestration({})
    const ok = completeRun(id)
    expect(ok).toBe(true)
    const runs = getRuns()
    expect(runs[0].status).toBe('completed')
  })

  it('completeRun returns false for unknown id', () => {
    expect(completeRun('orc_missing')).toBe(false)
  })
})


