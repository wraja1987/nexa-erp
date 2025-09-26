import { NextResponse } from 'next/server'
import { audit } from '../../../../lib/log/mask'

export async function GET() {
  const configured = Boolean(process.env.OPEN_BANKING_CLIENT_ID && process.env.OPEN_BANKING_CLIENT_SECRET && String(process.env.OPEN_BANKING_ENV).toLowerCase() === 'sandbox')
  audit({ route: '/api/open-banking/health', ip: '0.0.0.0', session: 'health' })
  return NextResponse.json(configured ? { ok: true, status: 'active' } : { ok: false, status: 'not_configured' })
}


