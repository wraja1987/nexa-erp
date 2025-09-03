import { NextResponse } from 'next/server'
import { getRecentAudits } from '../../../../lib/log/mask'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../lib/rbac'

export async function GET(req: Request) {
  const role = getRoleFromRequest(req)
  const guard = ensureRoleAllowed('enterprise', role)
  if (!guard.ok || role !== 'superadmin') {
    return NextResponse.json({ ok: false, code: 403, message: 'Forbidden' }, { status: 403 })
  }
  const url = new URL(req.url)
  const module = url.searchParams.get('module') || undefined
  const action = url.searchParams.get('action') || undefined
  const items = getRecentAudits({ module, action })
  return NextResponse.json({ ok: true, items })
}


