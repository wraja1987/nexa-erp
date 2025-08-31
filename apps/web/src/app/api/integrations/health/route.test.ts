import { describe, it, expect } from 'vitest'
import { ConnectorHealthSchema } from '../../../../types/phase6'

describe('integrations health DTO', () => {
  it('validates connector health item shape', () => {
    const ok = ConnectorHealthSchema.safeParse({ key: 'shopify', healthy: true, checkedAt: new Date().toISOString() })
    expect(ok.success).toBe(true)
  })
})


