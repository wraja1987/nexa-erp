export type LineInput = {
  qty: number
  unitPrice: number
  taxRate: number // e.g. 0.2 for 20%
}

export type LineTotals = {
  subtotal: number
  tax: number
  total: number
}

export function roundCurrencyMinor(value: number): number {
  return Math.round(value)
}

export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100)
}

export function fromMinorUnits(minor: number): number {
  return Math.round(minor) / 100
}

export function computeLineTotals({ qty, unitPrice, taxRate }: LineInput): LineTotals {
  const subtotal = qty * unitPrice
  const tax = subtotal * taxRate
  const total = subtotal + tax
  return { subtotal, tax, total }
}

export function sumLines(lines: LineTotals[]): LineTotals {
  const subtotal = lines.reduce((a, b) => a + b.subtotal, 0)
  const tax = lines.reduce((a, b) => a + b.tax, 0)
  const total = lines.reduce((a, b) => a + b.total, 0)
  return { subtotal, tax, total }
}



