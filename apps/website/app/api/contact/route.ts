import { NextResponse } from 'next/server'
import { z } from 'zod'

const Schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  message: z.string().min(5),
})

const bucket = new Map<string, { count: number; ts: number }>()

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'local'
  const entry = bucket.get(ip) || { count: 0, ts: Date.now() }
  const now = Date.now()
  if (now - entry.ts > 60_000) { entry.count = 0; entry.ts = now }
  entry.count += 1
  bucket.set(ip, entry)
  if (entry.count > 5) return NextResponse.json({ ok: false, status: 'rate_limited' }, { status: 429 })

  try {
    const body = await req.json()
    const data = Schema.parse(body)
    // In production: send via SendGrid/SMTP
    console.log('[contact]', { name: data.name, email: data.email, company: data.company })
    return NextResponse.json({ ok: true, status: 'received' })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'invalid'
    return NextResponse.json({ ok: false, status: 'error', error: message }, { status: 400 })
  }
}
