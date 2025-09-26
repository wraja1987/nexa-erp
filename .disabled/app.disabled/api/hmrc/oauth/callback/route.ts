import { NextResponse } from 'next/server'
import { audit } from '../../../../../lib/log/mask'

export async function GET() {
  audit({ route: '/api/hmrc/oauth/callback', ip: '0.0.0.0', session: 'hmrc' })
  return NextResponse.json({ ok: true, status: 'active' })
}


