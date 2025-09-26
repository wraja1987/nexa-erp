import { NextResponse } from 'next/server'
import { audit } from '../../../../lib/log/mask'

export async function GET() {
  const configured = Boolean(process.env.OPEN_BANKING_CLIENT_ID && process.env.OPEN_BANKING_CLIENT_SECRET && String(process.env.OPEN_BANKING_ENV).toLowerCase() === 'sandbox')
  audit({ route: '/api/open-banking/auth', ip: '0.0.0.0', session: 'ob' })
  if (!configured) return NextResponse.json({ ok: false, status: 'not_configured', error: 'Open Banking not configured' }, { status: 200 })
  return NextResponse.json({ ok: true, status: 'active', data: { authUrl: 'https://auth.truelayer-sandbox.com/demo' } })
}


