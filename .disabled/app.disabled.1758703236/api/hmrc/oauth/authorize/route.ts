import { NextResponse } from 'next/server'
import { audit } from '../../../../../lib/log/mask'

export async function GET() {
  const configured = Boolean(process.env.HMRC_CLIENT_ID && process.env.HMRC_CLIENT_SECRET && String(process.env.HMRC_ENVIRONMENT).toLowerCase() === 'sandbox' && process.env.HMRC_VRN)
  audit({ route: '/api/hmrc/oauth/authorize', ip: '0.0.0.0', session: 'hmrc' })
  if (!configured) return NextResponse.json({ ok: false, status: 'not_configured' }, { status: 200 })
  return NextResponse.json({ ok: true, status: 'active', data: { authUrl: 'https://test-hmrc.service.gov.uk/oauth/authorize' } })
}


