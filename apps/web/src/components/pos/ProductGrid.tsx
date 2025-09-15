"use client"
import { useMemo } from 'react'

export type Product = { sku: string; name: string; priceMinor: number; taxRate: number }

export function ProductGrid({ products, onAdd }: { products: Product[]; onAdd: (p: Product) => void }) {
  const items = useMemo(() => products, [products])
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
      {items.map(p => (
        <button key={p.sku} onClick={() => onAdd(p)} style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, textAlign: 'left', background: '#fff' }}>
          <div style={{ fontWeight: 600 }}>{p.name}</div>
          <div style={{ fontSize: 12, color: '#4b5563' }}>{p.sku}</div>
          <div style={{ marginTop: 6, fontSize: 12 }}>{(p.priceMinor/100).toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })}</div>
        </button>
      ))}
    </div>
  )
}



