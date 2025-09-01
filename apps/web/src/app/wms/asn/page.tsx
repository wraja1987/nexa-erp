import ComingSoonBadge from '../../../components/ui/ComingSoonBadge'

export default function WmsAsnPage() {
  const rows = [ { asn:'ASN-1001', supplier:'ACME', lines: 12 }, { asn:'ASN-1002', supplier:'Contoso', lines: 7 } ]
  const exportCsv = () => {
    const header = 'asn,supplier,lines\n'
    const body = rows.map(r=>`${r.asn},${r.supplier},${r.lines}`).join('\n')
    const blob = new Blob([header+body], { type:'text/csv' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='asn-demo.csv'; a.click(); URL.revokeObjectURL(url)
  }
  return (
    <main role="main" style={{ padding: 16 }}>
      <h1 style={{ display:'flex', alignItems:'center', gap:8 }}>WMS ASN <ComingSoonBadge /></h1>
      <p>Advance Shipment Notices preview with demonstration rows only.</p>
      <div style={{overflowX:'auto'}}>
        <table role="table" aria-label="ASN list"><thead><tr><th>ASN</th><th>Supplier</th><th>Lines</th></tr></thead>
          <tbody>{rows.map((r,i)=> <tr key={i}><td>{r.asn}</td><td>{r.supplier}</td><td>{r.lines}</td></tr>)}</tbody>
        </table>
      </div>
      <button onClick={exportCsv} style={{marginTop:12}}>Export CSV</button>
    </main>
  )
}


