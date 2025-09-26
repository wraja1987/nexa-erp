import { NextResponse } from 'next/server'
import { audit } from '../../../../lib/log/mask'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const accountId = url.searchParams.get('accountId') || 'acc_demo_1'
  const configured = Boolean(process.env.OPEN_BANKING_CLIENT_ID && process.env.OPEN_BANKING_CLIENT_SECRET && String(process.env.OPEN_BANKING_ENV).toLowerCase() === 'sandbox')
  audit({ route: '/api/open-banking/transactions', ip: '0.0.0.0', session: 'ob', accountId })
  if (!configured) return NextResponse.json({ ok: false, status: 'not_configured' }, { status: 200 })
  return NextResponse.json({ ok: true, status: 'active', data: [{ id: 'tx1', accountId, amountMinor: -1299, description: 'Coffee Shop' }, { id: 'tx2', accountId, amountMinor: 50000, description: 'Salary' }] })
}


