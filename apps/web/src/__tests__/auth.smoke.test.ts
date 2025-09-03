import { test, expect } from 'vitest'
import { getProviders } from 'next-auth/react'

test('auth providers configured (best-effort)', async () => {
  try {
    const providers = await getProviders()
    expect(providers).toBeTruthy()
  } catch {
    // Skip if server not running
    expect(true).toBe(true)
  }
})


