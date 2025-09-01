export default function AiRunsPage() {
  return (
    <main>
      <h1>AI Orchestration • Runs</h1>
      <p className="text-muted">View and monitor AI workflow runs.</p>
      <RunsTable />
      <button className="btn-primary">Add run</button>
    </main>
  )
}

async function fetchRuns() {
  const res = await fetch('/api/orchestration/runs', { cache: 'no-store' })
  if (!res.ok) return { items: [] as Array<{ id: string; enqueuedAt: string; status: string }> }
  return (await res.json()) as { items: Array<{ id: string; enqueuedAt: string; status: string }> }
}

async function RunsTable() {
  const { items } = await fetchRuns()
  return (
    <table className="table" style={{ marginTop: 12 }}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Enqueued</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {items.map((it) => (
          <tr key={it.id}>
            <td>{it.id}</td>
            <td>{new Date(it.enqueuedAt).toLocaleString()}</td>
            <td>{it.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}



