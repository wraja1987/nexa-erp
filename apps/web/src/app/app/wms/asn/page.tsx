"use client"
import { useEffect, useState } from 'react'

type ASN = { id: string; number: string; supplierRef?: string; status: string; eta?: string }

export default function WmsAsnPage() {
  const [rows, setRows] = useState<ASN[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/wms/asn').then(r=>r.json()).then(j=>{ setRows(j?.data || []); setLoading(false) }).catch(()=>setLoading(false))
  }, [])
  const exportCsv = () => {
    const header = 'asn,supplierRef,status,eta\n'
    const body = rows.map(r=>`${r.number},${r.supplierRef||''},${r.status},${r.eta? new Date(r.eta).toISOString():''}`).join('\n')
    const blob = new Blob([header+body], { type:'text/csv' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='asn.csv'; a.click(); URL.revokeObjectURL(url)
  }
  return (
    <main role="main" style={{ padding: 16 }}>
      <h1>WMS ASN</h1>
      {loading ? <div>Loading…</div> : (
        <div style={{overflowX:'auto'}}>
          <table role="table" aria-label="ASN list"><thead><tr><th>ASN</th><th>Supplier Ref</th><th>Status</th><th>ETA</th></tr></thead>
            <tbody>{rows.map((r)=> <tr key={r.id}><td>{r.number}</td><td>{r.supplierRef||'-'}</td><td>{r.status}</td><td>{r.eta? new Date(r.eta).toLocaleDateString():'-'}</td></tr>)}</tbody>
          </table>
        </div>
      )}
      <button onClick={exportCsv} style={{marginTop:12}}>Export CSV</button>
    </main>
  )
}



