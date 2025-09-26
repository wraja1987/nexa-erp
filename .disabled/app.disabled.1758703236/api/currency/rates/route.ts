import { NextRequest } from 'next/server'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { prisma } from '../../../../lib/db'

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get('from') || undefined
  const to = req.nextUrl.searchParams.get('to') || undefined
  const where: Prisma.CurrencyRateWhereInput = {}
  if (from) where.fromCode = from
  if (to) where.toCode = to
  const items = await prisma.currencyRate.findMany({ where, orderBy: { asOfDate: 'desc' }, take: 100 })
  return Response.json({ ok:true, items })
}

const bodySchema = z.object({ fromCode: z.string(), toCode: z.string(), rate: z.number(), asOfDate: z.string().transform(s=>new Date(s)) })
export async function POST(req: NextRequest) {
  try {
    const b = bodySchema.parse(await req.json())
    const rec = await prisma.currencyRate.create({ data: { fromCode: b.fromCode, toCode: b.toCode, rate: b.rate, asOfDate: b.asOfDate } })
    return Response.json({ ok:true, id: rec.id })
  } catch {
    return Response.json({ ok:false, code:400, message:'Invalid body' }, { status: 400 })
  }
}





