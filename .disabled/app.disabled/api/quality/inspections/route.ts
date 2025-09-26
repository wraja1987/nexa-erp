import { NextRequest } from 'next/server'
import { prisma } from '../../../../lib/db'
import { ensureRoleAllowed } from '../../../../lib/rbac'

export async function GET(req: NextRequest) {
  try {
    ensureRoleAllowed(req, ['wms'])
    const tenantId = req.headers.get('x-tenant-id') || 't1'
    const items = await prisma.qualityInspection.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 50 })
    return Response.json({ ok: true, items })
  } catch {
    return Response.json({ ok:false, code:403, message:'Forbidden' }, { status:403 })
  }
}






