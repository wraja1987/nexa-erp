"use client"
import { useEffect, useMemo, useState } from 'react'
import type { Product } from './ProductGrid'

export type CartLine = Product & { qty: number }

export function Cart({ currency = 'GBP', onPay }: { currency?: string; onPay: (method: 'CASH'|'CARD', totalMinor: number, lines: CartLine[]) => void }) {
  const [lines, setLines] = useState<CartLine[]>([])

  useEffect(() => {
    const raw = localStorage.getItem('pos_cart_v1')
    if (raw) setLines(JSON.parse(raw) as CartLine[])
  }, [])

  useEffect(() => {
    localStorage.setItem('pos_cart_v1', JSON.stringify(lines))
  }, [lines])

  const totals = useMemo(() => {
    const subtotal = lines.reduce((a, l) => a + l.priceMinor * l.qty, 0)
    const tax = lines.reduce((a, l) => a + Math.round(l.priceMinor * l.qty * l.taxRate), 0)
    const total = subtotal + tax
    return { subtotal, tax, total }
  }, [lines])

  return (
    <div>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: '#fff' }}>
        {lines.length === 0 && <div style={{ color: '#6b7280' }}>Cart is empty</div>}
        {lines.map((l, i) => (
          <div key={l.sku + i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #e5e7eb' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{l.name}</div>
              <div style={{ fontSize: 12, color: '#4b5563' }}>{l.sku}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => setLines(prev => prev.map((x, idx) => idx === i ? { ...x, qty: Math.max(1, x.qty - 1) } : x))}>-</button>
              <span>{l.qty}</span>
              <button onClick={() => setLines(prev => prev.map((x, idx) => idx === i ? { ...x, qty: x.qty + 1 } : x))}>+</button>
            </div>
            <div style={{ width: 100, textAlign: 'right' }}>{(l.priceMinor * l.qty / 100).toLocaleString('en-GB', { style: 'currency', currency })}</div>
            <button onClick={() => setLines(prev => prev.filter((_, idx) => idx !== i))} aria-label="Remove">×</button>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center' }}>
        <div>
          <div>Subtotal: {(totals.subtotal/100).toLocaleString('en-GB', { style: 'currency', currency })}</div>
          <div>VAT: {(totals.tax/100).toLocaleString('en-GB', { style: 'currency', currency })}</div>
          <div style={{ fontWeight: 700 }}>Total: {(totals.total/100).toLocaleString('en-GB', { style: 'currency', currency })}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onPay('CASH', totals.total, lines)} style={{ padding: '10px 14px' }}>Cash</button>
          <button onClick={() => onPay('CARD', totals.total, lines)} style={{ padding: '10px 14px' }}>Card</button>
        </div>
      </div>
    </div>
  )
}



