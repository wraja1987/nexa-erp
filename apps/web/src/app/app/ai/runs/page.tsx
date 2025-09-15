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

async function fetchRuns(status?: string, page = 1, pageSize = 10) {
  const u = new URL('/api/orchestration/runs', 'http://localhost')
  if (status) u.searchParams.set('status', status)
  u.searchParams.set('page', String(page))
  u.searchParams.set('pageSize', String(pageSize))
  const res = await fetch(u.toString(), { cache: 'no-store' })
  if (!res.ok) return { items: [] as Array<{ id: string; enqueuedAt: string; status: string }>, total: 0, page, pageSize }
  return (await res.json()) as { items: Array<{ id: string; enqueuedAt: string; status: string }>; total: number; page: number; pageSize: number }
}

async function RunsTable() {
  const { items, total, page, pageSize } = await fetchRuns()
  return (
    <>
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
    <p className="text-muted">Total: {total} • Page {page} • Page size {pageSize}</p>
    </>
  )
}



