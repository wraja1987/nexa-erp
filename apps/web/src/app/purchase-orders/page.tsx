"use client"
import { useEffect, useState } from 'react'

type PoLine = { lineNo: number; sku: string; qty: number; price: number }
type PO = { id: string; number: string; supplierId: string; currency: string; expectedAt?: string; createdAt: string; lines?: PoLine[] }

export default function PurchaseOrders() {
  const [rows, setRows] = useState<PO[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/po/orders').then(r=>r.json()).then(j=>{ setRows(j?.data || []); setLoading(false) }).catch(()=>setLoading(false))
  }, [])
  return (
    <main>
      <div className="card" style={{ marginTop: 12 }}>
        <h2 style={{ marginTop: 0 }}>Purchase Orders</h2>
        <p className="text-muted">Latest orders (demo). Export as CSV or create new orders via API.</p>
        {loading ? <div>Loading…</div> : (
          <div style={{ overflowX:'auto', marginTop: 12 }}>
            <table role="table" aria-label="Purchase orders" style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr><th>No</th><th>Supplier</th><th>Currency</th><th>Expected</th><th>Lines</th></tr></thead>
              <tbody>
                {rows.map(po => (
                  <tr key={po.id}>
                    <td>{po.number}</td>
                    <td title={po.supplierId}>{po.supplierId.slice(0,8)}…</td>
                    <td>{po.currency}</td>
                    <td>{po.expectedAt ? new Date(po.expectedAt).toLocaleDateString() : '-'}</td>
                    <td>{po.lines?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
