"use client"
import { useEffect, useState } from 'react'

export default function POSAdminPage() {
  const [shiftId, setShiftId] = useState<string | null>(null)
  const [report, setReport] = useState<any>(null)
  const [storeId, setStoreId] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const s = await (await fetch('/api/pos/store/ensure', { method: 'POST', headers: { 'x-role': 'admin' } })).json()
      setStoreId(s.store?.id || null)
    })()
  }, [])

  const openShift = async () => {
    const res = await fetch('/api/pos/shift/open', { method: 'POST', headers: { 'content-type': 'application/json', 'x-role': 'admin' }, body: JSON.stringify({ storeId, openedByUserId: 'manager-1', openingFloatMinor: 0 }) })
    const data = await res.json()
    if (data.ok) setShiftId(data.shift.id)
  }
  const closeShift = async () => {
    if (!shiftId) return
    const res = await fetch('/api/pos/shift/close', { method: 'POST', headers: { 'content-type': 'application/json', 'x-role': 'admin' }, body: JSON.stringify({ shiftId, closingFloatMinor: 0 }) })
    await res.json()
  }
  const loadZ = async () => {
    if (!shiftId) return
    const res = await fetch('/api/pos/reports/z?shiftId=' + shiftId, { headers: { 'x-role': 'admin' } })
    setReport(await res.json())
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>POS Admin</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={openShift}>Open shift</button>
        <button onClick={closeShift} disabled={!shiftId}>Close shift</button>
        <button onClick={loadZ} disabled={!shiftId}>Load Z Report</button>
      </div>
      {report && <pre style={{ background: '#111827', color: '#e5e7eb', padding: 12, borderRadius: 8 }}>{JSON.stringify(report, null, 2)}</pre>}
    </main>
  )
}



