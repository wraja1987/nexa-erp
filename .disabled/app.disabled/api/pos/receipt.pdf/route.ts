import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import fs from 'node:fs/promises'

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const id = url.searchParams.get('saleId')
  if (!id) return new NextResponse('Missing saleId', { status: 400 })
  const sale = await prisma.posSale.findUnique({ where: { id }, include: { lines: true, payments: true, store: true } })
  if (!sale) return new NextResponse('Not found', { status: 404 })

  const pdf = await PDFDocument.create()
  const page = pdf.addPage([420, 620])
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

  let y = 600
  try {
    const logoPath = process.cwd() + '/apps/web/public/logo-nexa.png'
    const bytes = await fs.readFile(logoPath).catch(() => null as any)
    if (bytes) {
      const png = await pdf.embedPng(bytes)
      const pngDims = png.scale(0.25)
      page.drawImage(png, { x: 24, y: 560, width: pngDims.width, height: pngDims.height })
      y = 540
    }
  } catch {}
  const draw = (text: string, opts?: { x?: number; y?: number; size?: number; bold?: boolean }) => {
    const size = opts?.size ?? 11
    const x = opts?.x ?? 24
    const yy = opts?.y ?? y
    page.drawText(text, { x, y: yy, size, font: opts?.bold ? bold : font, color: rgb(0.1, 0.1, 0.12) })
    if (!opts?.y) y = yy - size - 6
  }

  draw('Nexa ERP — Receipt', { bold: true, size: 14 })
  draw(`Sale: ${sale.saleNumber}`)
  draw(`Store: ${sale.store?.name || 'Store'} (${sale.store?.code || ''})`)
  draw(`Date: ${new Date(sale.createdAt).toLocaleString('en-GB')}`)
  y -= 6
  page.drawLine({ start: { x: 24, y }, end: { x: 396, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.85) })
  y -= 12

  draw('Item', { bold: true })
  page.drawText('Qty', { x: 260, y: y + 0, size: 11, font })
  page.drawText('Line', { x: 320, y: y + 0, size: 11, font })
  y -= 6
  page.drawLine({ start: { x: 24, y }, end: { x: 396, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.85) })
  y -= 8

  for (const l of sale.lines) {
    draw(`${l.name}`)
    page.drawText(String(l.qty), { x: 260, y: y + 0, size: 11, font })
    const line = (Number(l.lineTotal) / 100).toLocaleString('en-GB', { style: 'currency', currency: sale.currency })
    page.drawText(line, { x: 320, y: y + 0, size: 11, font })
  }

  y -= 6
  page.drawLine({ start: { x: 24, y }, end: { x: 396, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.85) })
  y -= 12
  const fmt = (n: number) => (n / 100).toLocaleString('en-GB', { style: 'currency', currency: sale.currency })
  draw(`Subtotal: ${fmt(Number(sale.subtotal))}`)
  draw(`VAT: ${fmt(Number(sale.tax))}`)
  draw(`Total: ${fmt(Number(sale.total))}`, { bold: true })

  y -= 12
  draw('Payment summary', { bold: true })
  const cash = sale.payments.filter(p => p.method === 'cash').reduce((a, p) => a + Number(p.amount), 0)
  const card = sale.payments.filter(p => p.method === 'card').reduce((a, p) => a + Number(p.amount), 0)
  draw(`Cash: ${fmt(cash)}`)
  draw(`Card: ${fmt(card)}`)

  y -= 18
  draw('Thank you for your purchase.', { size: 10 })

  const bytes = await pdf.save()
  const buffer = Buffer.from(bytes)
  return new NextResponse(buffer, { headers: { 'content-type': 'application/pdf' } })
}



