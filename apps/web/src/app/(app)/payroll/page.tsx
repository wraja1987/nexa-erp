"use client"
import { useEffect, useState } from 'react'

type Run = { id: string; periodStart: string; periodEnd: string; status: string }

export default function PayrollPage() {
  const [runs, setRuns] = useState<Run[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/payroll/runs').then(r=>r.json()).then(j=>{ setRuns(j?.data || []); setLoading(false) }).catch(()=>setLoading(false))
  }, [])
  const exportCsv = () => {
    const header = 'periodStart,periodEnd,status\n'
    const body = runs.map(r=>`${new Date(r.periodStart).toISOString()},${new Date(r.periodEnd).toISOString()},${r.status}`).join('\n')
    const blob = new Blob([header + body], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'payroll-runs.csv'
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <main role="main" style={{ padding: 16 }}>
      <h1>Payroll</h1>
      {loading ? <div>Loading…</div> : (
        <div style={{ overflowX:'auto' }}>
          <table role="table" aria-label="Payroll runs" style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                <th>Period Start</th><th>Period End</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r)=> (
                <tr key={r.id}>
                  <td>{new Date(r.periodStart).toLocaleDateString()}</td><td>{new Date(r.periodEnd).toLocaleDateString()}</td><td>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ marginTop:12, display:'flex', gap:8 }}>
        <button onClick={exportCsv}>Export CSV</button>
      </div>
    </main>
  )
}



