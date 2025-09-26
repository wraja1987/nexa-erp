import { NextResponse } from 'next/server'
import { getRuns, completeRun } from '../../../../lib/orchestration/runner'
import { audit } from '../../../../lib/log/mask'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const status = url.searchParams.get('status') as 'queued' | 'completed' | null
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get('pageSize') || '10')))
  let items = getRuns()
  if (status === 'queued' || status === 'completed') items = items.filter((i) => i.status === status)
  const total = items.length
  const start = (page - 1) * pageSize
  const paged = items.slice(start, start + pageSize)
  audit({ route: '/api/orchestration/runs', count: paged.length, total, status: status || 'all' })
  return NextResponse.json({ items: paged, total, page, pageSize })
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


