"use client"
import ComingSoonBadge from '../../../../components/ui/ComingSoonBadge'

export default function MrpPage() {
  const rows = [ { sku:'NEX-001', qty:120 }, { sku:'NEX-002', qty:85 } ]
  return (
    <main role="main" style={{ padding: 16 }}>
      <h1 style={{ display:'flex', alignItems:'center', gap:8 }}>MRP <ComingSoonBadge /></h1>
      <p>Material requirements planning preview with example planned orders.</p>
      <div style={{overflowX:'auto'}}>
        <table role="table" aria-label="MRP"><thead><tr><th>SKU</th><th>Qty</th></tr></thead>
          <tbody>{rows.map((r,i)=> <tr key={i}><td>{r.sku}</td><td>{r.qty}</td></tr>)}</tbody>
        </table>
      </div>
    </main>
  )
}


