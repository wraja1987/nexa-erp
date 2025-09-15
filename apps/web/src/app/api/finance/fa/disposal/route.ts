import { NextRequest } from 'next/server'
import { z } from 'zod'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '../../../../../lib/db'
import { audit } from '../../../../../lib/log/mask'
import { ensureRoleAllowed } from '../../../../../lib/rbac'

const bodySchema = z.object({
  tenantId: z.string(),
  assetId: z.string(),
  disposedAt: z.string().transform((s)=> new Date(s)),
  proceeds: z.number().nonnegative().default(0),
  notes: z.string().optional()
})

export async function POST(req: NextRequest) {
  const started = Date.now()
  const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID()
  try {
    ensureRoleAllowed(req, ['finance'])
    const data = await req.json().catch(()=>null)
    const body = bodySchema.parse(data)

    const asset = await prisma.fixedAsset.findFirst({ where: { id: body.assetId, tenantId: body.tenantId } })
    if (!asset) return Response.json({ ok:false, code:404, message:'Asset not found' }, { status:404 })

    const dep = await prisma.depreciationSchedule.aggregate({ _sum: { amount: true }, where: { tenantId: body.tenantId, assetId: body.assetId } })
    const accumulated = dep._sum.amount || 0 as any
    const nbv = (asset.cost as any) - (accumulated as any)
    const gainLoss = (body.proceeds as any) - (nbv as any)

    const rec = await prisma.fixedAssetDisposal.create({ data: { tenantId: body.tenantId, assetId: body.assetId, disposedAt: body.disposedAt, proceeds: body.proceeds as any, gainLoss: gainLoss as any, notes: body.notes } })
    await prisma.fixedAsset.update({ where: { id: asset.id }, data: { disposedAt: body.disposedAt, disposalProceeds: body.proceeds, disposalNotes: body.notes } })

    await audit({ correlationId, action:'FA_DISPOSAL', route:'/api/finance/fa/disposal', status:'ok', data:{ assetId: asset.id, recId: rec.id } })
    return Response.json({ ok:true, disposalId: rec.id, gainLoss })
  } catch (e: any) {
    await audit({ correlationId, action:'FA_DISPOSAL', route:'/api/finance/fa/disposal', status:'error', data:{ message: e?.message } })
    const code = e?.code === 'FORBIDDEN' ? 403 : 400
    return Response.json({ ok:false, code, message: 'Request failed' }, { status: code })
  } finally {
    void started
  }
}





