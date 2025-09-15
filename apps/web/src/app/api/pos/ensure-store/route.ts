import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ensureRoleAllowed, getRoleFromRequest } from '@/lib/rbac'

export async function POST(req: Request): Promise<NextResponse> {
  const role = getRoleFromRequest(req)
  const check = ensureRoleAllowed('pos', role)
  if (!check.ok) return NextResponse.json({ ok: false, error: 'access_denied' }, { status: 403 })

  const tenantId = 't1'
  const code = 'MAIN'
  let store = await prisma.store.findFirst({ where: { tenantId, code } })
  if (!store) {
    store = await prisma.store.create({ data: { tenantId, code, name: 'Main Store', timezone: 'Europe/London' } })
  }
  return NextResponse.json({ ok: true, store })
}


