import { NextResponse } from 'next/server'
import { audit } from '../../../lib/log/mask'

export async function GET() {
  audit({ route: '/api/health', session: 'health', ip: '0.0.0.0' })
  return NextResponse.json({ ok: true, status: 'healthy' })
}


