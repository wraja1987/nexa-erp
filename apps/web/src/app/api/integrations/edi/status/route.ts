import { NextResponse } from 'next/server'
import { ConnectorHealthSchema } from '../../../../../types/phase6'
import { audit } from '../../../../../lib/log/mask'

export async function GET() {
  const now = new Date().toISOString()
  const item = { key: 'edi', healthy: true, checkedAt: now }
  ConnectorHealthSchema.parse(item)
  audit({ route: '/api/integrations/edi/status', session: 'health', ip: '0.0.0.0' })
  return NextResponse.json(item)
}


