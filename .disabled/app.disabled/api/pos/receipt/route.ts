import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import { ensureRoleAllowed, getRoleFromRequest } from '../../../../lib/rbac'

export async function GET(req: Request): Promise<Response> {
  const role = getRoleFromRequest(req)
  const check = ensureRoleAllowed('pos', role)
  if (!check.ok) return new NextResponse('Forbidden', { status: 403 })
  const url = new URL(req.url)
  const id = url.searchParams.get('saleId')
  if (!id) return new NextResponse('Missing saleId', { status: 400 })
  const sale = await prisma.posSale.findUnique({ where: { id }, include: { lines: true, payments: true } })
  if (!sale) return new NextResponse('Not found', { status: 404 })
  const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Receipt ${sale.saleNumber}</title><style>body{font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial;padding:24px} h1{font-size:18px;margin:0 0 8px} table{width:100%;border-collapse:collapse;margin-top:12px} th,td{border-bottom:1px solid #e5e7eb;padding:6px 0;text-align:left} .tot{font-weight:700}</style></head><body>
  <h1>Nexa ERP — Receipt</h1>
  <div>Sale: ${sale.saleNumber}</div>
  <div>Date: ${new Date(sale.createdAt).toLocaleString('en-GB')}</div>
  <table><thead><tr><th>Item</th><th>Qty</th><th style="text-align:right">Line</th></tr></thead><tbody>
  ${sale.lines.map(l => `<tr><td>${l.name}</td><td>${l.qty}</td><td style=\"text-align:right\">${(Number(l.lineTotal)/100).toLocaleString('en-GB',{style:'currency',currency:sale.currency})}</td></tr>`).join('')}
  </tbody></table>
  <div style="margin-top:12px">Subtotal: ${(Number(sale.subtotal)/100).toLocaleString('en-GB',{style:'currency',currency:sale.currency})}</div>
  <div>VAT: ${(Number(sale.tax)/100).toLocaleString('en-GB',{style:'currency',currency:sale.currency})}</div>
  <div class="tot">Total: ${(Number(sale.total)/100).toLocaleString('en-GB',{style:'currency',currency:sale.currency})}</div>
  </body></html>`
  return new NextResponse(html, { headers: { 'content-type': 'text/html; charset=utf-8' } })
}



