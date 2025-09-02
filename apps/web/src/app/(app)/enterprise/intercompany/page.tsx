export default function EnterpriseIntercompanyPage() {
  return (
    <main>
      <h1>Enterprise • Intercompany</h1>
      <p className="text-muted">Record intercompany journals and eliminations. Demo counts shown.</p>
      <Summary />
      <Form />
      <Table />
    </main>
  )
}

async function fetchHealth() {
  const res = await fetch('/api/integrations/health', { cache: 'no-store' })
  if (!res.ok) return { items: [] as Array<{ key: string; healthy: boolean; checkedAt: string }> }
  return (await res.json()) as { items: Array<{ key: string; healthy: boolean; checkedAt: string }> }
}

async function Summary() {
  const { items } = await fetchHealth()
  const healthy = items.filter((i) => i.healthy).length
  return (
    <div className="card" style={{ marginTop: 12 }}>
      <h3 style={{ marginTop: 0 }}>Connector health</h3>
      <p>{healthy} healthy of {items.length}</p>
    </div>
  )
}

async function listTxns() {
  const res = await fetch('/api/enterprise/intercompany', { cache: 'no-store' })
  if (!res.ok) return [] as any[]
  const js = await res.json()
  return js.data || []
}

async function Table() {
  const rows = await listTxns()
  return (
    <div className="card" style={{ marginTop: 12 }}>
      <h3 style={{ marginTop: 0 }}>Recent intercompany</h3>
      <table>
        <thead><tr><th>Ref</th><th>From</th><th>To</th><th>Amount</th></tr></thead>
        <tbody>
          {rows.map((r:any)=> (
            <tr key={r.id}><td>{r.ref}</td><td>{r.fromEntityId}</td><td>{r.toEntityId}</td><td>{r.amount}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

'use client'
function Form() {
  async function onSubmit(formData: FormData) {
    const payload = {
      fromEntityId: String(formData.get('from')),
      toEntityId: String(formData.get('to')),
      ref: String(formData.get('ref')),
      amount: Number(formData.get('amount') || 0),
      currency: 'GBP',
    }
    await fetch('/api/enterprise/intercompany', { method: 'POST', headers: { 'content-type': 'application/json', 'x-role': 'admin' }, body: JSON.stringify(payload) })
    location.reload()
  }
  return (
    <form action={onSubmit} style={{ display:'flex', gap:8, marginTop:12 }}>
      <input name="ref" placeholder="Ref" aria-label="Reference" required />
      <input name="from" placeholder="From entity" aria-label="From entity" required />
      <input name="to" placeholder="To entity" aria-label="To entity" required />
      <input name="amount" type="number" step="0.01" placeholder="Amount" aria-label="Amount" required />
      <button type="submit">Post</button>
    </form>
  )
}



