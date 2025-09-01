import { describe, it, expect, vi } from 'vitest'
import { enforceTokenCaps, recordEvaluation } from './governance'

vi.mock('../log/mask', () => ({ audit: vi.fn() }))

describe('AI governance', () => {
  it('caps input by approx token count', () => {
    const input = 'x'.repeat(100)
    const out = enforceTokenCaps(input, 10) // ~40 chars
    expect(out.length).toBeLessThanOrEqual(40)
  })
  it('returns empty when maxTokens invalid or zero', () => {
    expect(enforceTokenCaps('abc', 0)).toBe('')
    expect(enforceTokenCaps('abc', NaN as any)).toBe('')
  })
  it('records evaluation via audit', async () => {
    recordEvaluation('cap-test', { a: 1 })
    const { audit } = await import('../log/mask') as any
    expect(audit).toHaveBeenCalled()
  })
})



