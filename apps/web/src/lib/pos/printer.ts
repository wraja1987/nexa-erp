export type PrinterMode = 'pdf' | 'network'

async function printViaNetwork(saleId: string): Promise<void> {
  const host = process.env.POS_PRINTER_HOST || '127.0.0.1'
  const port = Number(process.env.POS_PRINTER_PORT || 9100)
  const { createConnection } = await import('node:net')
  const { prisma } = await import('../db')
  const sale = await prisma.posSale.findUnique({ where: { id: saleId }, include: { lines: true, payments: true, store: true } })
  if (!sale) return
  const c = createConnection({ host, port })
  const write = (text: string) => c.write(text)
  const esc = '\x1b'
  const nl = '\n'
  write(esc + 'E' + '\x01') // bold on
  write('Nexa ERP' + nl)
  write(esc + 'E' + '\x00') // bold off
  write(`Sale ${sale.saleNumber}` + nl)
  write(`Store ${(sale.store?.code || '')}` + nl)
  write('-'.repeat(32) + nl)
  for (const l of sale.lines) {
    write(`${l.name}`.slice(0, 24) + nl)
    write(`  x${String(l.qty)}  £${(Number(l.lineTotal)/100).toFixed(2)}` + nl)
  }
  write('-'.repeat(32) + nl)
  const fmt = (n: number) => `£${(n/100).toFixed(2)}`
  write(`Subtotal ${fmt(Number(sale.subtotal))}` + nl)
  write(`VAT      ${fmt(Number(sale.tax))}` + nl)
  write(`Total    ${fmt(Number(sale.total))}` + nl)
  write(nl + 'Thank you' + nl + nl + nl)
  c.end()
}

export async function printReceipt(options: { saleId: string; mode?: PrinterMode }): Promise<{ ok: true }> {
  const mode = options.mode || (process.env.POS_PRINTER_MODE as PrinterMode) || 'pdf'
  if (mode === 'network') {
    await printViaNetwork(options.saleId).catch(()=>{})
    return { ok: true }
  }
  // PDF handled by /api/pos/receipt.pdf
  return { ok: true }
}



