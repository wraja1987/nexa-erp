import { NextResponse } from 'next/server'
import { ConnectorKey, ConnectorHealthSchema } from '../../../../types/phase6'
import { audit } from '../../../../lib/log/mask'

export async function GET() {
  const now = new Date().toISOString()
  const keys = ConnectorKey.options
  const items = keys.map((k) => ({ key: k, healthy: true, checkedAt: now }))
  // validate shape
  for (const it of items) ConnectorHealthSchema.parse(it)
  audit({ route: '/api/integrations/health', session: 'health', ip: '0.0.0.0' })
  return NextResponse.json({ items })
}


