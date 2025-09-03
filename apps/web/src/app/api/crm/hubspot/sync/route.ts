import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ensureRoleAllowed, getRoleFromRequest, ensurePermissionAllowed, getActorIdFromRequest } from '../../../../../lib/rbac'
import { audit } from '../../../../../lib/log/mask'
import { withCorrelation } from '../../../../../lib/logger'

const Body = z.object({ tenantId: z.string().optional(), since: z.coerce.date().optional() })

export async function POST(req: Request) {
  const corr = withCorrelation()
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('marketplace', role)
    if (!guard.ok) return NextResponse.json({ ok: false, code: 'access_denied', message: 'Forbidden' }, { status: 403 })
    const perm = ensurePermissionAllowed('crm:sync', role)
    if (!perm.ok) return NextResponse.json({ ok: false, code: 403, message: 'Forbidden' }, { status: 403 })
    const body = Body.parse(await req.json().catch(async () => { const t = await req.text(); return JSON.parse(t || '{}') }))
    // Placeholder sync logic (mirror contacts/deals)
    const synced = { contacts: 0, deals: 0 }
    audit({ route: '/api/crm/hubspot/sync', module: 'crm', action: 'CRM_SYNC', status: 'ok', actorId: getActorIdFromRequest(req), tenantId: body.tenantId || 't1' })
    return NextResponse.json({ ok: true, synced, ...corr })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/crm/hubspot/sync', module: 'crm', action: 'CRM_SYNC', status: 'error', message })
    return NextResponse.json({ ok: false, code: 'bad_request', message, ...corr }, { status: 400 })
  }
}


