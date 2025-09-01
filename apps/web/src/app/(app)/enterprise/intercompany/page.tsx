export default function EnterpriseIntercompanyPage() {
  return (
    <main>
      <h1>Enterprise • Intercompany</h1>
      <p className="text-muted">Record intercompany journals and eliminations. Demo counts shown.</p>
      <Summary />
      <button className="btn-primary">Add intercompany journal</button>
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



