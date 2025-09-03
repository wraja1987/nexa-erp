import { describe, it, expect } from 'vitest'
import { GET } from './route'

describe('billing webhook status', () => {
  it('responds 200 with configured flag', async () => {
    const prev = process.env.STRIPE_WEBHOOK_SECRET
    delete process.env.STRIPE_WEBHOOK_SECRET
    const res = (await GET()) as Response
    const json: any = await (res as any).json()
    expect(json.ok).toBe(true)
    expect(typeof json.configured).toBe('boolean')
    process.env.STRIPE_WEBHOOK_SECRET = prev
  })
})


