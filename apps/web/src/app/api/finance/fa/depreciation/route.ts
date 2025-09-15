import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../../lib/db'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../../lib/rbac'
import { audit } from '../../../../../lib/log/mask'
import { withCorrelation } from '../../../../../lib/logger'

const GenBody = z.object({ tenantId: z.string().min(1), assetId: z.string().min(1), start: z.coerce.date(), months: z.coerce.number().int().positive() })

export async function POST(req: Request) {
  const corr = withCorrelation()
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('enterprise', role)
    if (!guard.ok) return NextResponse.json({ ok: false, code: 403, message: 'Forbidden', ...corr }, { status: 403 })
    const raw = await req.json().catch(async () => { const t = await req.text(); return JSON.parse(t || '{}') })
    const body = GenBody.parse(raw)
    const asset = await prisma.fixedAsset.findUniqueOrThrow({ where: { id: body.assetId } })
    const monthly = (Number(asset.cost) - Number(asset.salvage)) / asset.usefulLifeM
    const rows: Array<{ tenantId: string; assetId: string; period: Date; amount: number }> = []
    for (let i = 0; i < body.months; i++) {
      const period = new Date(body.start)
      period.setMonth(period.getMonth() + i)
      rows.push({ tenantId: body.tenantId, assetId: asset.id, period, amount: monthly })
    }

    const created = await prisma.$transaction(rows.map((r) =>
      prisma.depreciationSchedule.upsert({
        // Fallback: use a stable synthetic unique by hashing fields when composite name unknown
        where: { id: `${r.tenantId}:${r.assetId}:${r.period.toISOString()}` },
        update: { amount: r.amount as any },
        create: { ...r } as any,
      })
    ))

    audit({ route: '/api/finance/fa/depreciation', module: 'finance', action: 'FA_DEPR_GEN', status: 'ok', count: created.length })
    return NextResponse.json({ ok: true, count: created.length, ...corr })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Bad Request'
    audit({ route: '/api/finance/fa/depreciation', module: 'finance', action: 'FA_DEPR_GEN', status: 'error', message })
    return NextResponse.json({ ok: false, code: 'bad_request', message, ...corr }, { status: 400 })
  }
}






