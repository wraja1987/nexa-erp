export default function EnterpriseConsolidationPage() {
  return (
    <main>
      <h1>Enterprise • Consolidation</h1>
      <p className="text-muted">View consolidation summaries. Demo data counts shown.</p>
      <DemoSummary />
      <button className="btn-primary">Add consolidation</button>
    </main>
  )
}

async function fetchDemo() {
  const res = await fetch('/api/enterprise/demo', { cache: 'no-store' })
  if (!res.ok) return { entities: 0, intercompany: 0, consolidations: 0 }
  return (await res.json()) as { entities: number; intercompany: number; consolidations: number }
}

async function DemoSummary() {
  const d = await fetchDemo()
  return (
    <div className="card" style={{ marginTop: 12 }}>
      <h3 style={{ marginTop: 0 }}>Demo counts</h3>
      <ul>
        <li>Entities: {d.entities}</li>
        <li>Intercompany journals: {d.intercompany}</li>
        <li>Consolidations: {d.consolidations}</li>
      </ul>
    </div>
  )
}



