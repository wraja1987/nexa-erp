// Security middleware consolidated here for build compatibility

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Security headers and simple in-memory rate limiting (100 req/min per IP)
const securityHeaders: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'"
}

const WINDOW_SEC = 60
const LIMIT = 100
const rateMap = new Map<string, { count: number; ts: number }>()

async function incrUpstash(key: string): Promise<{ count: number } | null> {
  const base = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!base || !token) return null
  try {
    // INCR and set expiry on first increment
    const url = `${base}/incr/${encodeURIComponent(key)}`
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    const data = await resp.json().catch(() => ({}))
    const count = typeof data.result === 'number' ? data.result : Number(data.result)
    if (count === 1) {
      await fetch(`${base}/expire/${encodeURIComponent(key)}/${WINDOW_SEC}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    }
    return { count: Number.isFinite(count) ? count : 1 }
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  if (process.env.E2E_TEST === '1') {
    return NextResponse.next();
  }
  const res = NextResponse.next()
  Object.entries(securityHeaders).forEach(([k, v]) => res.headers.set(k, v))

  const { pathname } = req.nextUrl
  const isExempt = pathname.startsWith('/api/health') || pathname.startsWith('/api/readyz') || pathname.startsWith('/api/stripe/webhook')
  if (pathname.startsWith('/api') && !isExempt) {
    const fwd = req.headers.get('x-forwarded-for') || ''
    const ipFromHeader = (fwd.split(',')[0] || '').trim()
    const ip = ipFromHeader || '0.0.0.0'
    const key = `ratelimit:${ip}:${Math.floor(Date.now() / (WINDOW_SEC * 1000))}`

    // Try Upstash REST first
    const up = await incrUpstash(key)
    if (up) {
      if (up.count > LIMIT) {
        return NextResponse.json({ ok: false, code: 429, message: 'Too Many Requests' }, { status: 429, headers: res.headers })
      }
    } else {
      // Fallback to in-memory (per-instance)
      const now = Date.now()
      const rec = rateMap.get(key) || { count: 0, ts: now }
      if (now - rec.ts > WINDOW_SEC * 1000) { rec.count = 0; rec.ts = now }
      rec.count += 1
      rateMap.set(key, rec)
      if (rec.count > LIMIT) {
        return NextResponse.json({ ok: false, code: 429, message: 'Too Many Requests' }, { status: 429, headers: res.headers })
      }
    }
  }
  return res
}

export const config = { matcher: ['/((?!_next|static|favicon.ico).*)'] }


