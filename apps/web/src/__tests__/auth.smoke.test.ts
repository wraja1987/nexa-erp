import { test, expect } from 'vitest'
import { getProviders } from 'next-auth/react'

test('auth providers configured', async () => {
  const providers = await getProviders()
  expect(providers).toBeTruthy()
})


