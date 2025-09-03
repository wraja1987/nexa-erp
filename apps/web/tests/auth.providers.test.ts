import { describe, test, expect } from 'vitest'
import { buildAuthConfig } from '@/src/lib/auth/options'

describe('auth providers', () => {
  test('includes credentials provider by default', () => {
    const cfg = buildAuthConfig()
    const ids = cfg.providers?.map((p: any)=>p.id) || []
    expect(ids).toContain('credentials')
  })

  test('google provider appears when envs set', () => {
    process.env.GOOGLE_CLIENT_ID = 'x'
    process.env.GOOGLE_CLIENT_SECRET = 'y'
    const cfg = buildAuthConfig()
    const ids = cfg.providers?.map((p: any)=>p.id) || []
    expect(ids).toContain('google')
    delete process.env.GOOGLE_CLIENT_ID
    delete process.env.GOOGLE_CLIENT_SECRET
  })

  test('microsoft provider appears when envs set', () => {
    process.env.MICROSOFT_CLIENT_ID = 'x'
    process.env.MICROSOFT_CLIENT_SECRET = 'y'
    const cfg = buildAuthConfig()
    const ids = cfg.providers?.map((p: any)=>p.id) || []
    expect(ids).toContain('azure-ad')
    delete process.env.MICROSOFT_CLIENT_ID
    delete process.env.MICROSOFT_CLIENT_SECRET
  })
})


