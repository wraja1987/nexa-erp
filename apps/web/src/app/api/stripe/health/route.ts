import { NextResponse } from 'next/server'
import { audit } from '../../../../lib/log/mask'

export async function GET() {
  const ok = Boolean(process.env.STRIPE_SECRET_KEY)
  audit({ route: '/api/stripe/health', ip: '0.0.0.0', session: 'health' })
  return NextResponse.json(ok ? { ok: true, status: 'active' } : { ok: false, status: 'not_configured', reason: 'not_configured' }, { status: ok ? 200 : 200 })
}


