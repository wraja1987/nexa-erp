import { describe, it, expect } from 'vitest'
import { ConnectorHealthSchema } from '../../../../../types/phase6'

describe('ebay status DTO', () => {
  it('validates health shape', () => {
    const now = new Date().toISOString()
    const ok = ConnectorHealthSchema.safeParse({ key: 'ebay', healthy: true, checkedAt: now })
    expect(ok.success).toBe(true)
  })
})


