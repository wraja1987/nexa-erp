import { NextResponse } from 'next/server'
import { audit } from '../../../lib/log/mask'

const counters: Record<string, number> = {}

export function incr(route: string) {
  counters[route] = (counters[route] || 0) + 1
}

export async function GET() {
  audit({ route: '/api/metrics', session: 'metrics', ip: '0.0.0.0' })
  return NextResponse.json({ ok: true, status: 'active', data: counters })
}


