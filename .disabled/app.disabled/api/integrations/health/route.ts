import { NextResponse } from 'next/server'
import { ConnectorKey, ConnectorHealthSchema } from '../../../../types/phase6'
import { audit } from '../../../../lib/log/mask'

export async function GET() {
  const now = new Date().toISOString()
  const keys = ConnectorKey.options
  const isEnabled = (key: (typeof keys)[number]): boolean => {
    const envMap: Record<string, string> = {
      shopify: 'CONNECTOR_SHOPIFY_ENABLED',
      amazon: 'CONNECTOR_AMAZON_ENABLED',
      ebay: 'CONNECTOR_EBAY_ENABLED',
      hmrc_rti: 'CONNECTOR_HMRC_RTI_ENABLED',
      open_banking: 'CONNECTOR_OPEN_BANKING_ENABLED',
      edi: 'CONNECTOR_EDI_ENABLED',
    }
    const varName = envMap[key]
    const v = process.env[varName]
    if (v == null) return true
    return v === '1' || v?.toLowerCase() === 'true' || v === 'on'
  }
  const items = keys.map((k) => ({ key: k, healthy: isEnabled(k), checkedAt: now }))
  // validate shape
  for (const it of items) ConnectorHealthSchema.parse(it)
  audit({ route: '/api/integrations/health', session: 'health', ip: '0.0.0.0' })
  return NextResponse.json({ items })
}


