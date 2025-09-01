import ComingSoonBadge from '../../../components/ui/ComingSoonBadge'

export default function MtdVatPage() {
  const rows = [
    { box: 'Box 1', amount: 1234.56 },
    { box: 'Box 4', amount: 800.00 },
    { box: 'Net VAT', amount: 434.56 },
  ]
  const exportCsv = () => {
    const header = 'box,amount\n'
    const body = rows.map(r=>`${r.box},${r.amount}`).join('\n')
    const blob = new Blob([header + body], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'vat-draft-demo.csv'; a.click(); URL.revokeObjectURL(url)
  }
  return (
    <main role="main" style={{ padding: 16 }}>
      <h1 style={{ display:'flex', alignItems:'center', gap:8 }}>HMRC MTD VAT <ComingSoonBadge /></h1>
      <p>Draft view of a VAT return with example figures. All connections are mocked.</p>
      <div role="status" aria-live="polite" style={{ background:'#fff6d6', padding:12, borderRadius:8, margin:'12px 0' }}>
        This module is coming soon. Live features will include HMRC MTD integration and submissions.
      </div>
      <button disabled title="Mocked">Connect HMRC (Mocked)</button>
      <div style={{ overflowX:'auto', marginTop:12 }}>
        <table role="table" aria-label="VAT draft" style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr><th>Box</th><th>Amount</th></tr></thead>
          <tbody>
            {rows.map((r,i)=> (<tr key={i}><td>{r.box}</td><td>£{r.amount}</td></tr>))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop:12 }}>
        <button onClick={exportCsv}>Export CSV</button>
      </div>
      <section aria-labelledby="ai-help" style={{ marginTop:16, padding:12, border:'1px solid #eaecef', borderRadius:8 }}>
        <h2 id="ai-help">What Nexa AI will do here</h2>
        <ul>
          <li>Highlight large variances vs prior periods.</li>
          <li>Explain box calculations in plain English.</li>
          <li>Draft submission note for audit.</li>
        </ul>
      </section>
    </main>
  )
}


