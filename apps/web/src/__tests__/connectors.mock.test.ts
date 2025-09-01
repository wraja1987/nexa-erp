import { describe, it, expect } from 'vitest'
import { isConnected, connect, disconnect } from '../lib/connectors/mockConnectorService'

describe('mockConnectorService', () => {
  it('connects and disconnects', async () => {
    expect(isConnected('google')).toBe(false)
    await connect('google')
    expect(isConnected('google')).toBe(true)
    await disconnect('google')
    expect(isConnected('google')).toBe(false)
  })
})


