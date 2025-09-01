"use client"
import ComingSoonBadge from '../../../../components/ui/ComingSoonBadge'

export default function ApsPage() {
  const rows = [ { sku:'NEX-001', start:'2025-09-01', end:'2025-09-03' } ]
  return (
    <main role="main" style={{ padding: 16 }}>
      <h1 style={{ display:'flex', alignItems:'center', gap:8 }}>APS <ComingSoonBadge /></h1>
      <p>Advanced planning and scheduling preview with demonstration jobs.</p>
      <div style={{overflowX:'auto'}}>
        <table role="table" aria-label="APS"><thead><tr><th>SKU</th><th>Start</th><th>End</th></tr></thead>
          <tbody>{rows.map((r,i)=> <tr key={i}><td>{r.sku}</td><td>{r.start}</td><td>{r.end}</td></tr>)}</tbody>
        </table>
      </div>
    </main>
  )
}


