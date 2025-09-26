/* eslint-disable @typescript-eslint/no-explicit-any */
export default function MarketplacePage() {
  return (
    <main>
      <h1>Marketplace / EDI</h1>
      <Orders />
      <NewOrder />
    </main>
  )
}

async function fetchOrders() {
  const res = await fetch('/api/marketplace/orders', { cache: 'no-store' })
  if (!res.ok) return [] as any[]
  const js = await res.json()
  return js.data || []
}

async function Orders() {
  const rows = await fetchOrders()
  return (
    <div className="card" style={{ marginTop: 12 }}>
      <h3 style={{ marginTop: 0 }}>Recent external orders</h3>
      <table>
        <thead><tr><th>Ext ID</th><th>Channel</th><th>Status</th><th>Total</th></tr></thead>
        <tbody>
          {rows.map((r:any)=> (
            <tr key={r.id}><td>{r.extId}</td><td>{r.channelId}</td><td>{r.status}</td><td>{r.total}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

import NewOrder from './NewOrder'

