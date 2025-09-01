import { NextResponse } from 'next/server'
import { getRuns, completeRun } from '../../../../lib/orchestration/runner'
import { audit } from '../../../../lib/log/mask'

export async function GET() {
  const items = getRuns()
  audit({ route: '/api/orchestration/runs', count: items.length })
  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const id = String(body?.id || '')
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })
    const ok = completeRun(id)
    if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 })
    audit({ route: '/api/orchestration/runs', action: 'complete', id })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
}


