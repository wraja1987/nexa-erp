"use client"
import { useEffect, useMemo, useState } from "react"

type RunRow = { id: string; periodStart: string; periodEnd: string; scheduleId?: string; status: string; totalsGross?: number; totalsNet?: number }
type PayslipRow = { id: string; employeeId: string; gross?: number; net?: number; pdfUrl?: string }

export default function PayrollPage() {
  const [runs, setRuns] = useState<RunRow[]>([])
  const [selectedRunId, setSelectedRunId] = useState<string>("")
  const [payslips, setPayslips] = useState<PayslipRow[]>([])
  const [loadingRuns, setLoadingRuns] = useState(false)
  const [loadingPayslips, setLoadingPayslips] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [periodStart, setPeriodStart] = useState("")
  const [periodEnd, setPeriodEnd] = useState("")
  const [scheduleId, setScheduleId] = useState("")
  const [error, setError] = useState<string>("")

  useEffect(() => {
    setLoadingRuns(true)
    fetch("/api/payroll/runs", { headers: { "x-role": "admin" } })
      .then(r => r.json())
      .then(json => {
        const items = (json.items || []).map((r: any) => ({
          id: r.id,
          periodStart: r.periodStart,
          periodEnd: r.periodEnd,
          scheduleId: r.scheduleId,
          status: r.status,
          totalsGross: r.totalsGross?.toNumber?.() ?? r.totalsGross ?? undefined,
          totalsNet: r.totalsNet?.toNumber?.() ?? r.totalsNet ?? undefined,
        }))
        setRuns(items)
        if (items.length) setSelectedRunId(items[0].id)
      })
      .catch(() => setError("Failed to load runs"))
      .finally(() => setLoadingRuns(false))
  }, [])

  useEffect(() => {
    if (!selectedRunId) return
    setLoadingPayslips(true)
    fetch(`/api/payroll/payslips?runId=${encodeURIComponent(selectedRunId)}`, { headers: { "x-role": "admin" } })
      .then(r => r.json())
      .then(json => {
        const items = (json.items || []).map((p: any) => ({
          id: p.id,
          employeeId: p.employeeId,
          gross: p.gross?.toNumber?.() ?? p.gross ?? p.grossPay,
          net: p.net?.toNumber?.() ?? p.net ?? p.netPay,
          pdfUrl: p.pdfUrl,
        }))
        setPayslips(items)
      })
      .catch(() => setError("Failed to load payslips"))
      .finally(() => setLoadingPayslips(false))
  }, [selectedRunId])

  const onRunPayroll = async () => {
    setError("")
    try {
      const res = await fetch("/api/payroll/run", {
        method: "POST",
        headers: { "content-type": "application/json", "x-role": "admin" },
        body: JSON.stringify({ periodStart, periodEnd, scheduleId: scheduleId || undefined }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.message || "Failed to run payroll")
      setDrawerOpen(false)
      // refresh runs
      setLoadingRuns(true)
      const rr = await fetch("/api/payroll/runs", { headers: { "x-role": "admin" } })
      const rj = await rr.json()
      const items = (rj.items || []).map((r: any) => ({
        id: r.id,
        periodStart: r.periodStart,
        periodEnd: r.periodEnd,
        scheduleId: r.scheduleId,
        status: r.status,
        totalsGross: r.totalsGross?.toNumber?.() ?? r.totalsGross ?? undefined,
        totalsNet: r.totalsNet?.toNumber?.() ?? r.totalsNet ?? undefined,
      }))
      setRuns(items)
      setSelectedRunId(json.runId || items[0]?.id || "")
    } catch (e: any) {
      setError(e.message || "Failed to run payroll")
    } finally {
      setLoadingRuns(false)
    }
  }

  const onExportBacs = () => {
    if (!selectedRunId) return
    const url = `/api/payroll/export/bacs?runId=${encodeURIComponent(selectedRunId)}`
    window.open(url, "_blank")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Payroll</h1>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={() => setDrawerOpen(true)}>Run Payroll</button>
          <button className="px-3 py-2 rounded bg-gray-200" onClick={onExportBacs} disabled={!selectedRunId}>Export BACS</button>
        </div>
      </div>

      {error ? <div role="alert" className="text-red-700">{error}</div> : null}

      <section>
        <h2 className="text-lg font-medium mb-2">Runs</h2>
        {loadingRuns ? <div>Loading runs…</div> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Period</th>
                <th className="py-2">Schedule</th>
                <th className="py-2">Status</th>
                <th className="py-2">Gross</th>
                <th className="py-2">Net</th>
                <th className="py-2">Select</th>
              </tr>
            </thead>
            <tbody>
              {runs.map(r => (
                <tr key={r.id} className="border-b">
                  <td className="py-2">{new Date(r.periodStart).toLocaleDateString()} – {new Date(r.periodEnd).toLocaleDateString()}</td>
                  <td className="py-2">{r.scheduleId || '-'}</td>
                  <td className="py-2"><span className="px-2 py-1 rounded bg-gray-100">{r.status}</span></td>
                  <td className="py-2">{r.totalsGross ?? '-'}</td>
                  <td className="py-2">{r.totalsNet ?? '-'}</td>
                  <td className="py-2"><input aria-label={`select run ${r.id}`} type="radio" name="run" checked={selectedRunId===r.id} onChange={() => setSelectedRunId(r.id)} /></td>
                </tr>
              ))}
              {runs.length === 0 ? <tr><td className="py-4" colSpan={6}>No runs yet.</td></tr> : null}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Payslips</h2>
        {loadingPayslips ? <div>Loading payslips…</div> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Employee</th>
                <th className="py-2">Gross</th>
                <th className="py-2">Net</th>
                <th className="py-2">PDF</th>
              </tr>
            </thead>
            <tbody>
              {payslips.map(p => (
                <tr key={p.id} className="border-b">
                  <td className="py-2">{p.employeeId}</td>
                  <td className="py-2">{p.gross ?? '-'}</td>
                  <td className="py-2">{p.net ?? '-'}</td>
                  <td className="py-2">{p.pdfUrl ? <a className="text-blue-600 underline" href={p.pdfUrl} target="_blank" rel="noreferrer">Download</a> : '-'}</td>
                </tr>
              ))}
              {payslips.length === 0 ? <tr><td className="py-4" colSpan={4}>No payslips for selected run.</td></tr> : null}
            </tbody>
          </table>
        )}
      </section>

      {drawerOpen ? (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded shadow w-full max-w-md p-4">
            <h3 className="text-lg font-medium mb-3">Run Payroll</h3>
            <form className="space-y-3" onSubmit={e => { e.preventDefault(); onRunPayroll() }}>
              <div>
                <label htmlFor="ps" className="block text-sm">Period start</label>
                <input id="ps" type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} className="mt-1 w-full border rounded px-2 py-1" required />
              </div>
              <div>
                <label htmlFor="pe" className="block text-sm">Period end</label>
                <input id="pe" type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} className="mt-1 w-full border rounded px-2 py-1" required />
              </div>
              <div>
                <label htmlFor="sid" className="block text-sm">Schedule ID (optional)</label>
                <input id="sid" type="text" value={scheduleId} onChange={e => setScheduleId(e.target.value)} className="mt-1 w-full border rounded px-2 py-1" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" className="px-3 py-2 rounded border" onClick={() => setDrawerOpen(false)}>Cancel</button>
                <button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white">Run</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

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



