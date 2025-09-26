import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../lib/db'
import { ensureRoleAllowed } from '../../../../lib/rbac'

const schema = z.object({
  tenantId: z.string().default('t1'),
  type: z.enum(['inspection','hold','capa']),
  id: z.string(),
  status: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    ensureRoleAllowed(req, ['wms'])
    const body = schema.parse(await req.json())
    if (body.type === 'inspection') {
      await prisma.qualityInspection.update({ where: { id: body.id }, data: { status: body.status as any } })
    } else if (body.type === 'hold') {
      await prisma.qualityHold.update({ where: { id: body.id }, data: { status: body.status as any } })
    } else {
      await prisma.capa.update({ where: { id: body.id }, data: { status: body.status as any } })
    }
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok:false, code:400, message:'Invalid request' }, { status:400 })
  }
}






