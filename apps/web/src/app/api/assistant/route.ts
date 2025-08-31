import { NextResponse } from 'next/server'
import { audit } from '../../../lib/log/mask'

const rateLimitWindowMs = 60_000
const maxRequestsPerWindow = 30
const tokenBudgetPerSession = 2_000

const ipToHits: Map<string, { count: number; windowStart: number }> = new Map()
const sessionToTokens: Map<string, number> = new Map()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const rec = ipToHits.get(ip)
  if (!rec || now - rec.windowStart > rateLimitWindowMs) {
    ipToHits.set(ip, { count: 1, windowStart: now })
    return false
  }
  rec.count += 1
  return rec.count > maxRequestsPerWindow
}

function mask(value: string | undefined): string {
  if (!value) return ''
  return value.replace(/[A-Za-z0-9]/g, '*')
}

export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') || 'local').split(',')[0].trim()
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  const session = req.headers.get('x-session') || ip
  const used = sessionToTokens.get(session) ?? 0
  if (used > tokenBudgetPerSession) {
    return NextResponse.json({ error: 'token_budget_exceeded' }, { status: 429 })
  }

  const body = (await req.json().catch(() => ({}))) as {
    route?: string
    userContext?: unknown
    lastError?: string
    selection?: string
  }
  const route = String(body.route || '')
  const lastError = mask(body.lastError)
  const selection = mask(body.selection)

  sessionToTokens.set(session, used + Math.min(200, (selection?.length || 0) + (lastError?.length || 0)))

  // Emit masked audit log (IP/session always masked within audit())
  audit({ ip, session, route })

  return NextResponse.json({ message: `Assistant ready for ${route}`, actions: [] })
}


