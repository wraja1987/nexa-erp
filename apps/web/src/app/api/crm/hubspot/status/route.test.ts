import { describe, it, expect } from 'vitest'
import { GET } from './route'

describe('hubspot status', () => {
  it('responds 200 with configured flag', async () => {
    const prev = process.env.HUBSPOT_CLIENT_ID
    const prev2 = process.env.HUBSPOT_CLIENT_SECRET
    delete process.env.HUBSPOT_CLIENT_ID
    delete process.env.HUBSPOT_CLIENT_SECRET
    const res = (await GET()) as Response
    const json: any = await (res as any).json()
    expect(json.ok).toBe(true)
    expect(typeof json.configured).toBe('boolean')
    process.env.HUBSPOT_CLIENT_ID = prev
    process.env.HUBSPOT_CLIENT_SECRET = prev2
  })
})


