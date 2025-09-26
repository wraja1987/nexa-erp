import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'

vi.mock('node:fs', () => ({
  default: {
    readFileSync: vi.fn(() => JSON.stringify({ entities: [{}], intercompanyJournals: [{}, {}], consolidations: [{}] })),
  },
  readFileSync: vi.fn(() => JSON.stringify({ entities: [{}], intercompanyJournals: [{}, {}], consolidations: [{}] })),
}))

describe('enterprise demo route', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns counts from demo file', async () => {
    const res = await GET()
    const json = await (res as any).json()
    expect(json).toEqual({ entities: 1, intercompany: 2, consolidations: 1 })
  })

  it('returns zeroed counts on error', async () => {
    const fs = await import('node:fs') as any
    const target = fs.default?.readFileSync ? fs.default : fs
    target.readFileSync.mockImplementationOnce(() => { throw new Error('missing') })
    const res = await GET()
    const json = await (res as any).json()
    expect(json).toEqual({ entities: 0, intercompany: 0, consolidations: 0 })
  })
})


