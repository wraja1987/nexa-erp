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

'use client'
function NewOrder() {
  async function onSubmit(formData: FormData) {
    const payload = {
      tenantId: 'demo-tenant',
      channelId: String(formData.get('channel')),
      extId: String(formData.get('extId')),
      status: 'created',
      total: Number(formData.get('total') || 0),
    }
    await fetch('/api/marketplace/orders', { method: 'POST', headers: { 'content-type': 'application/json', 'x-role': 'admin' }, body: JSON.stringify(payload) })
    location.reload()
  }
  return (
    <form action={onSubmit} style={{ display:'flex', gap:8, marginTop:12 }}>
      <input name="channel" placeholder="Channel ID" required aria-label="Channel ID" />
      <input name="extId" placeholder="External ID" required aria-label="External ID" />
      <input name="total" type="number" step="0.01" placeholder="Total" required aria-label="Total" />
      <button type="submit">Add order</button>
    </form>
  )
}

"use client"
import ComingSoonBadge from '../../../components/ui/ComingSoonBadge'

export default function MarketplacePage() {
  const tiles = [ 'Shopify Connector', 'Xero Export', 'Open Banking', 'HMRC MTD' ]
  return (
    <main role="main" style={{ padding: 16 }}>
      <h1 style={{ display:'flex', alignItems:'center', gap:8 }}>Marketplace <ComingSoonBadge /></h1>
      <p>Preview of future apps available for Nexa ERP. This is a safe demonstration only.</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:12 }}>
        {tiles.map(t => (
          <div key={t} style={{ border:'1px solid #eaecef', borderRadius:8, padding:12 }}>
            <strong>{t}</strong>
            <div style={{ marginTop:8 }}><button disabled title="Mocked">View</button></div>
          </div>
        ))}
      </div>
    </main>
  )
}



