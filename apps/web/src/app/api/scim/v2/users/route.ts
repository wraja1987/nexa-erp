import { NextRequest } from 'next/server'
import { prisma } from '../../../../../lib/db'

export async function GET(req: NextRequest) {
  const startIndex = Number(req.nextUrl.searchParams.get('startIndex') || '1')
  const count = Number(req.nextUrl.searchParams.get('count') || '50')
  const filter = req.nextUrl.searchParams.get('filter') || ''
  const where: any = {}
  if (filter.includes('userName')) {
    const [, value] = filter.split('eq')
    const v = value?.trim()?.replace(/^"|"$/g, '')
    if (v) where.email = v
  }
  const total = await prisma.user.count({ where })
  const items = await prisma.user.findMany({ where, skip: Math.max(0, startIndex - 1), take: count })
  const Resources = items.map(u => ({ id: u.id, userName: u.email, active: u.active, emails: [{ value: u.email, primary: true }], meta: { resourceType: 'User' }, schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"] }))
  return Response.json({ Resources, totalResults: total, itemsPerPage: count, startIndex, schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"] })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=>null) as any
  const email = body?.userName || body?.emails?.[0]?.value
  if (!email) return Response.json({ schemas:["urn:ietf:params:scim:api:messages:2.0:Error"], detail:'Missing userName', status:'400' }, { status: 400 })
  const u = await prisma.user.create({ data: { email, tenant_id: 't1', role: 'USER', active: true } })
  return Response.json({ id: u.id, userName: u.email, active: u.active, schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"] }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(()=>null) as any
  const id = req.nextUrl.searchParams.get('id') || body?.id
  if (!id) return Response.json({ schemas:["urn:ietf:params:scim:api:messages:2.0:Error"], detail:'Missing id', status:'400' }, { status: 400 })
  const active = body?.active as boolean | undefined
  const userName = body?.userName as string | undefined
  const u = await prisma.user.update({ where: { id }, data: { active, email: userName } })
  return Response.json({ id: u.id, userName: u.email, active: u.active, schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"] })
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return Response.json({}, { status: 204 })
  await prisma.user.update({ where: { id }, data: { active: false } }).catch(()=>null)
  return Response.json({}, { status: 204 })
}


