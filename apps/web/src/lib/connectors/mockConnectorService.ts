import { audit } from '../log/mask'

export type ConnectorKey = 'google' | 'microsoft' | 'twilio' | 'stripe' | 'open-banking' | 'hmrc'

const state: Record<ConnectorKey, boolean> = {
  google: false,
  microsoft: false,
  twilio: false,
  stripe: false,
  'open-banking': false,
  hmrc: false,
}

export function isConnected(key: ConnectorKey): boolean {
  return !!state[key]
}

export async function connect(key: ConnectorKey): Promise<void> {
  state[key] = true
  audit({ route: '/settings/connectors', action: 'connect', key })
}

export async function disconnect(key: ConnectorKey): Promise<void> {
  state[key] = false
  audit({ route: '/settings/connectors', action: 'disconnect', key })
}


