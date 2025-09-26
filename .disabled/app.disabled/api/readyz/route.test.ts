import { describe, it, expect } from 'vitest'
import { GET } from './route'

describe('readyz', () => {
  it('responds ok', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
  })
})



