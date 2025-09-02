import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const rateMap = new Map<string, { count: number; ts: number }>()
const WINDOW_MS = 60_000
const MAX_REQ = 60

const securityHeaders: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next()
  Object.entries(securityHeaders).forEach(([k, v]) => res.headers.set(k, v))

  const { pathname } = req.nextUrl
  const isExempt = pathname.startsWith('/api/health') || pathname.startsWith('/api/readyz') || pathname.startsWith('/api/stripe/webhook')
  if (pathname.startsWith('/api') && !isExempt) {
    const ip = req.ip || req.headers.get('x-forwarded-for') || '0.0.0.0'
    const now = Date.now()
    const rec = rateMap.get(ip) || { count: 0, ts: now }
    if (now - rec.ts > WINDOW_MS) { rec.count = 0; rec.ts = now }
    rec.count += 1
    rateMap.set(ip, rec)
    if (rec.count > MAX_REQ) {
      return NextResponse.json({ ok: false, status: 'rate_limited' }, { status: 429, headers: res.headers })
    }
  }
  return res
}

export const config = {
  matcher: ['/((?!_next|static|favicon.ico).*)']
}


