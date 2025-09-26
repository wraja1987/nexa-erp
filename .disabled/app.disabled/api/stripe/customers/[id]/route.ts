import { NextResponse } from 'next/server'
import { audit } from '../../../../../lib/log/mask'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const idParam = url.searchParams.get('id')
  const configured = Boolean(process.env.STRIPE_SECRET_KEY)
  audit({ route: '/api/stripe/customers/[id]', ip: '0.0.0.0', session: 'stripe' })
  if (!configured) return NextResponse.json({ ok: false, status: 'not_configured' }, { status: 200 })
  const id = idParam || 'cus_demo_123'
  return NextResponse.json({ ok: true, status: 'active', data: { id, name: 'Demo Customer', email: 'demo@example.com' } })
}


