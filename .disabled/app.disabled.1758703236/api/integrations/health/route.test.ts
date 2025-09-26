import { describe, it, expect } from 'vitest'
import { ConnectorHealthSchema, ConnectorKey } from '../../../../types/phase6'
import { GET } from './route'

describe('integrations health DTO', () => {
  it('validates connector health item shape', () => {
    const ok = ConnectorHealthSchema.safeParse({ key: 'shopify', healthy: true, checkedAt: new Date().toISOString() })
    expect(ok.success).toBe(true)
  })
  it('honors enable flags env', async () => {
    const prev = process.env.CONNECTOR_SHOPIFY_ENABLED
    const prev2 = process.env.CONNECTOR_AMAZON_ENABLED
    process.env.CONNECTOR_SHOPIFY_ENABLED = 'false'
    process.env.CONNECTOR_AMAZON_ENABLED = 'true'
    const res = await GET()
    const json = await (res as any).json()
    const shopify = json.items.find((x: any) => x.key === 'shopify')
    const amazon = json.items.find((x: any) => x.key === 'amazon')
    expect(shopify.healthy).toBe(false)
    expect(amazon.healthy).toBe(true)
    process.env.CONNECTOR_SHOPIFY_ENABLED = prev
    process.env.CONNECTOR_AMAZON_ENABLED = prev2
  })
})


