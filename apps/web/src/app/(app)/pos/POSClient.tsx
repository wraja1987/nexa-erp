"use client"
import { useEffect, useState } from 'react'
import { ProductGrid, type Product } from '../../../components/pos/ProductGrid'
import { Cart, type CartLine } from '../../../components/pos/Cart'

const MOCK: Product[] = [
  { sku: 'SKU-001', name: 'Notebook', priceMinor: 599, taxRate: 0.2 },
  { sku: 'SKU-002', name: 'Pen Blue', priceMinor: 199, taxRate: 0.2 },
  { sku: 'SKU-003', name: 'Stapler', priceMinor: 1299, taxRate: 0.2 },
  { sku: 'SKU-004', name: 'Box Files (5)', priceMinor: 2499, taxRate: 0.2 },
]

export default function POSClient() {
  const [products] = useState<Product[]>(MOCK)
  const [status, setStatus] = useState<string>('')
  const [storeReady, setStoreReady] = useState<boolean>(false)
  const [lastSaleId, setLastSaleId] = useState<string | null>(null)
  const [offline, setOffline] = useState<boolean>(true)

  useEffect(() => {
    fetch('/api/pos/store/ensure', { method: 'POST', headers: { 'x-role': 'admin' } })
      .then(() => setStoreReady(true))
      .catch(() => setStoreReady(false))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return
    const on = () => setOffline(!navigator.onLine)
    on()
    window.addEventListener('online', on)
    window.addEventListener('offline', on)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', on) }
  }, [])

  const handleAdd = (p: Product) => {
    const raw = localStorage.getItem('pos_cart_v1')
    const lines = raw ? (JSON.parse(raw) as CartLine[]) : []
    const idx = lines.findIndex(l => l.sku === p.sku)
    if (idx >= 0) lines[idx].qty += 1
    else lines.push({ ...p, qty: 1 })
    localStorage.setItem('pos_cart_v1', JSON.stringify(lines))
    setStatus('Added to cart')
    setTimeout(() => setStatus(''), 800)
  }

  const onPay = async (method: 'CASH'|'CARD', totalMinor: number, lines: CartLine[]) => {
    if (offline) { setStatus('Offline: park sale only'); return }
    setStatus('Processing...')
    const payload = {
      storeId: (await (await fetch('/api/pos/store/ensure', { method: 'POST', headers: { 'x-role': 'admin' } })).json()).store.id,
      cashierUserId: 'cashier-1',
      currency: 'GBP',
      lines: lines.map(l => ({ sku: l.sku, name: l.name, qty: l.qty, unitPriceMinor: l.priceMinor, taxRate: l.taxRate })),
    }
    const created = await fetch('/api/pos/sale', { method: 'POST', headers: { 'content-type': 'application/json', 'x-role': 'user' }, body: JSON.stringify(payload) })
    const saleRes = await created.json()
    if (!saleRes.ok) { setStatus('Sale failed'); return }
    const saleId = saleRes.sale.id as string
    const paid = await fetch('/api/pos/sale/pay', { method: 'POST', headers: { 'content-type': 'application/json', 'x-role': 'user' }, body: JSON.stringify({ saleId, method, amountMinor: totalMinor }) })
    const payRes = await paid.json()
    if (!payRes.ok) { setStatus('Payment failed'); return }
    localStorage.removeItem('pos_cart_v1')
    setStatus('Paid')
    setLastSaleId(saleId)
  }

  const parkSale = () => {
    const raw = localStorage.getItem('pos_cart_v1')
    if (raw) {
      const parked = JSON.parse(localStorage.getItem('pos_parked_v1') || '[]') as unknown[]
      parked.unshift({ at: Date.now(), lines: JSON.parse(raw) })
      localStorage.setItem('pos_parked_v1', JSON.stringify(parked))
      setStatus('Sale parked')
    }
  }

  useEffect(() => {
    const trySync = async () => {
      if (typeof navigator === 'undefined' || !navigator.onLine) return
      const raw = localStorage.getItem('pos_parked_v1')
      if (!raw) return
      const sales = JSON.parse(raw) as { at: number; lines: CartLine[] }[]
      if (!sales.length) return
      const storeId = (await (await fetch('/api/pos/store/ensure', { method: 'POST', headers: { 'x-role': 'admin' } })).json()).store.id
      const payload = { storeId, cashierUserId: 'cashier-1', sales: sales.map(s => ({ lines: s.lines.map(l => ({ sku: l.sku, name: l.name, qty: l.qty, unitPriceMinor: l.priceMinor, taxRate: l.taxRate })), totalMinor: s.lines.reduce((a, l) => a + Math.round(l.priceMinor * l.qty * (1 + l.taxRate)), 0) })) }
      const res = await fetch('/api/pos/offline/sync', { method: 'POST', headers: { 'content-type': 'application/json', 'x-role': 'admin' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (data?.ok) {
        localStorage.removeItem('pos_parked_v1')
        setStatus(`Reconciled ${data.reconciled} parked sales`)
      }
    }
    trySync()
  }, [offline])

  return (
    <main style={{ padding: 20 }}>
      <h1>Point of Sale</h1>
      {!storeReady && <div style={{ color: '#b45309', marginBottom: 8 }}>Preparing store...</div>}
      {offline && <div style={{ color: '#b91c1c', marginBottom: 8 }}>Offline: payments disabled, park sale instead</div>}
      {status && <div style={{ color: '#2563eb', marginBottom: 8 }}>{status}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div>
          <ProductGrid products={products} onAdd={handleAdd} />
        </div>
        <div>
          <Cart onPay={onPay} />
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button disabled={!lastSaleId} onClick={() => { if (lastSaleId) window.open(`/api/pos/receipt?saleId=${lastSaleId}&role=user`, '_blank') }}>Print receipt</button>
            <button onClick={parkSale}>Park sale</button>
          </div>
        </div>
      </div>
    </main>
  )
}





