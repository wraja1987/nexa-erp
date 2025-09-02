import { NextResponse } from 'next/server'
import { audit } from '../../../../lib/log/mask'

export async function GET() {
  const configured = Boolean(process.env.OPEN_BANKING_CLIENT_ID && process.env.OPEN_BANKING_CLIENT_SECRET && String(process.env.OPEN_BANKING_ENV).toLowerCase() === 'sandbox')
  audit({ route: '/api/open-banking/accounts', ip: '0.0.0.0', session: 'ob' })
  if (!configured) return NextResponse.json({ ok: false, status: 'not_configured' }, { status: 200 })
  return NextResponse.json({ ok: true, status: 'active', data: [{ id: 'acc_demo_1', name: 'Demo Checking', currency: 'GBP', balanceMinor: 123456 }] })
}


