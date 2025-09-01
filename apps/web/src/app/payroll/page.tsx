import ComingSoonBadge from '../../components/ui/ComingSoonBadge'

export default function PayrollPage() {
  const rows = [
    { employee: 'A. Example', period: 'Aug 2025', gross: 3200, net: 2500 },
    { employee: 'B. Sample', period: 'Aug 2025', gross: 3600, net: 2800 },
  ]
  const exportCsv = () => {
    const header = 'employee,period,gross,net\n'
    const body = rows.map(r=>`${r.employee},${r.period},${r.gross},${r.net}`).join('\n')
    const blob = new Blob([header + body], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'payslips-demo.csv'
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <main role="main" style={{ padding: 16 }}>
      <h1 style={{ display:'flex', alignItems:'center', gap:8 }}>Payroll <ComingSoonBadge /></h1>
      <p>Preview of payslips and totals for a typical monthly run. Figures are for demonstration only.</p>
      <div role="status" aria-live="polite" style={{ background:'#fff6d6', padding:12, borderRadius:8, margin:'12px 0' }}>
        This module is coming soon. Live features will include payroll journals, RTI, and approvals.
      </div>
      <div style={{ overflowX:'auto' }}>
        <table role="table" aria-label="Payslip preview" style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr>
              <th>Employee</th><th>Period</th><th>Gross</th><th>Net</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=> (
              <tr key={i}>
                <td>{r.employee}</td><td>{r.period}</td><td>£{r.gross}</td><td>£{r.net}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop:12, display:'flex', gap:8 }}>
        <button onClick={exportCsv}>Export CSV</button>
        <button disabled title="Mocked">Submit Run (Mocked)</button>
      </div>
      <section aria-labelledby="ai-help" style={{ marginTop:16, padding:12, border:'1px solid #eaecef', borderRadius:8 }}>
        <h2 id="ai-help">What Nexa AI will do here</h2>
        <ul>
          <li>Spot anomalies in net pay and advise checks.</li>
          <li>Draft payroll summary for finance approval.</li>
          <li>Suggest corrective journals for rounding differences.</li>
        </ul>
      </section>
    </main>
  )
}


