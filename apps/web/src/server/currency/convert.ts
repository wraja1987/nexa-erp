import { prisma } from '../../lib/db'

export async function convertAmount(amount: number, from: string, to: string, asOf = new Date()) {
  if (from === to) return amount
  const rate = await prisma.currencyRate.findFirst({ where: { fromCode: from, toCode: to, asOfDate: { lte: asOf } }, orderBy: { asOfDate: 'desc' } })
  if (!rate) throw new Error(`No FX rate ${from}->${to}`)
  return amount * Number(rate.rate)
}






