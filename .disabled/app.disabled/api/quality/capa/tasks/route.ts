import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../../lib/db'

const createSchema = z.object({ tenantId: z.string(), capaId: z.string(), title: z.string(), ownerId: z.string().optional() })

export async function GET(req: NextRequest) {
  const capaId = req.nextUrl.searchParams.get('capaId') || ''
  if (!capaId) return Response.json({ ok:false, code:400, message:'Missing capaId' }, { status:400 })
  const items = await prisma.notificationJob.findMany({ where: { templateId: capaId } })
  return Response.json({ ok:true, items })
}

export async function POST(req: NextRequest) {
  try {
    const b = createSchema.parse(await req.json())
    // Reuse NotificationJob as a simple tasks store for demo
    const task = await prisma.notificationJob.create({ data: { tenantId: b.tenantId, templateId: b.capaId, to: b.ownerId || 'unassigned', channel: 'task', status: 'queued' } })
    return Response.json({ ok:true, id: task.id })
  } catch {
    return Response.json({ ok:false, code:400, message:'Invalid request' }, { status:400 })
  }
}






