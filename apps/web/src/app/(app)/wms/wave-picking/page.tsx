"use client"
import { useEffect, useState } from 'react'

type Wave = { id: string; number: string; status: string; createdAt: string }

export default function WmsWavePickingPage() {
  const [rows, setRows] = useState<Wave[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/wms/waves').then(r=>r.json()).then(j=>{ setRows(j?.data || []); setLoading(false) }).catch(()=>setLoading(false))
  }, [])
  return (
    <main role="main" style={{ padding: 16 }}>
      <h1>WMS Wave Picking</h1>
      {loading ? <div>Loading…</div> : (
        <div style={{overflowX:'auto'}}>
          <table role="table" aria-label="Wave picking"><thead><tr><th>Wave</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>{rows.map((r)=> <tr key={r.id}><td>{r.number}</td><td>{r.status}</td><td>{new Date(r.createdAt).toLocaleString()}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </main>
  )
}



