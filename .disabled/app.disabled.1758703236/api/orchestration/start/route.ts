import { NextResponse } from 'next/server'
import { OrchestrationStartSchema, OrchestrationStartResultSchema } from '../../../../types/phase6'
import { audit } from '../../../../lib/log/mask'
import { enqueueOrchestration } from '../../../../lib/orchestration/runner'

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'local'
  const session = req.headers.get('x-session') || 'local'
  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
  const parse = OrchestrationStartSchema.safeParse(payload)
  if (!parse.success) {
    audit({ ip, session, route: '/api/orchestration/start', validation: 'fail' })
    return NextResponse.json({ error: 'invalid payload', issues: parse.error.issues }, { status: 400 })
  }
  const now = new Date().toISOString()
  const orchestrationId = enqueueOrchestration(parse.data)
  const result = { orchestrationId, acceptedAt: now }
  const check = OrchestrationStartResultSchema.safeParse(result)
  if (!check.success) {
    audit({ ip, session, route: '/api/orchestration/start', generate: 'fail' })
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
  audit({ ip, session, route: '/api/orchestration/start' })
  return NextResponse.json(check.data, { status: 202 })
}


