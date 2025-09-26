/* eslint-disable @typescript-eslint/no-explicit-any */
export default function EnterpriseIntercompanyPage() {
  return (
    <main>
      <h1>Enterprise • Intercompany</h1>
      <p className="text-muted">Record intercompany journals and eliminations. Demo counts shown.</p>
      <Summary />
      <IntercompanyForm />
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

import IntercompanyForm from './IntercompanyForm'



