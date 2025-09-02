import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { audit } from '../../../../lib/log/mask'

const prisma = new PrismaClient()

const CreateSchema = z.object({
  number: z.string().min(3),
  tenantId: z.string().min(1),
})

export async function GET() {
  const rows = await prisma.wave.findMany({ include: { pickTasks: true }, orderBy: { createdAt: 'desc' }, take: 50 })
  audit({ route: '/api/wms/waves', action: 'list' })
  return NextResponse.json({ ok: true, status: 'active', data: rows })
}

export async function POST(req: Request) {
  try {
    const data = CreateSchema.parse(await req.json())
    const created = await prisma.wave.create({ data })
    audit({ route: '/api/wms/waves', action: 'create' })
    return NextResponse.json({ ok: true, status: 'created', data: created }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'invalid'
    return NextResponse.json({ ok: false, status: 'error', error: message }, { status: 400 })
  }
}


