export default function SettingsEntitiesPage() {
  return (
    <main>
      <div className="card" style={{ marginTop: 12 }}>
        <h2 style={{ marginTop: 0 }}>Settings • Entities</h2>
        <p className="text-muted">Manage business entities. Demo view lists seeded items.</p>
        <EntitiesList />
      </div>
    </main>
  )
}

async function fetchEntities() {
  const res = await fetch('/api/entities', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load entities')
  return (await res.json()).items as Array<{ id: string; code: string; name: string; timezone?: string; active?: boolean }>
}

async function EntitiesList() {
  const items = await fetchEntities()
  return (
    <table className="table" style={{ marginTop: 12 }}>
      <thead>
        <tr>
          <th>Code</th>
          <th>Name</th>
          <th>Timezone</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {items.map((e) => (
          <tr key={e.id}>
            <td>{e.code}</td>
            <td>{e.name}</td>
            <td>{e.timezone ?? 'UTC'}</td>
            <td>{e.active ? 'Active' : 'Inactive'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}



