import { describe, it, expect } from 'vitest'
import { GET } from './route'

describe('shopify status', () => {
  it('responds 200 with JSON', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const json = await (res as any).json()
    expect(typeof json).toBe('object')
  })
})

import { describe, it, expect } from 'vitest'
import { ConnectorHealthSchema } from '../../../../../types/phase6'

describe('shopify status DTO', () => {
  it('validates health shape', () => {
    const now = new Date().toISOString()
    const ok = ConnectorHealthSchema.safeParse({ key: 'shopify', healthy: true, checkedAt: now })
    expect(ok.success).toBe(true)
  })
})


