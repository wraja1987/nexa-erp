import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { audit } from '../../../../lib/log/mask'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../lib/rbac'

const prisma = new PrismaClient()

const CreateSchema = z.object({
  tenantId: z.string().min(1),
  templateId: z.string().min(1),
  to: z.string().min(3),
  channel: z.enum(['sms', 'email']),
})

export async function POST(req: Request) {
  try {
    const role = getRoleFromRequest(req)
    const guard = ensureRoleAllowed('notifications', role)
    if (!guard.ok) return NextResponse.json({ ok: false, status: 'access_denied' }, { status: 403 })
    const data = CreateSchema.parse(await req.json())
    const created = await prisma.notificationJob.create({ data: { ...data, status: 'queued' } })
    audit({ route: '/api/notifications/send', action: 'queue' })
    return NextResponse.json({ ok: true, status: 'queued', data: created }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'invalid'
    return NextResponse.json({ ok: false, status: 'error', error: message }, { status: 400 })
  }
}


