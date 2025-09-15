import { NextRequest } from 'next/server'
import { prisma } from '../../../../lib/db'

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get('tenantId') || undefined
  const action = req.nextUrl.searchParams.get('action') || undefined
  const status = req.nextUrl.searchParams.get('status') || undefined
  const where: any = {}
  if (tenantId) where.tenantId = tenantId
  if (action) where.action = action
  if (status) where.data = { path: ['status'], equals: status } as any
  const items = await prisma.auditLog.findMany({ where, orderBy: { at: 'desc' }, take: 200 })
  return Response.json({ ok:true, items })
}






