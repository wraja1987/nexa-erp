"use client"
import { useEffect, useState } from 'react'

type Plan = { id: string; itemCode: string; suggestedQty: number; planDate: string; recommendation?: string }

export default function MrpPage() {
  const [rows, setRows] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/mfg/workorders').then(r=>r.json()).then(j=>{
      type WorkOrderDTO = { id: string; itemCode: string; quantity: number; createdAt: string }
      const arr: WorkOrderDTO[] = Array.isArray(j?.data) ? j.data : []
      const mapped = arr.map((w) => ({ id: w.id, itemCode: w.itemCode, suggestedQty: Number(w.quantity)||0, planDate: w.createdAt }))
      setRows(mapped); setLoading(false)
    }).catch(()=>setLoading(false))
  }, [])
  return (
    <main role="main" style={{ padding: 16 }}>
      <h1>MRP</h1>
      <p>Material requirements planning (demo). Shows suggested quantities and dates.</p>
      {loading ? <div>Loading…</div> : (
        <div style={{overflowX:'auto'}}>
          <table role="table" aria-label="MRP"><thead><tr><th>Item</th><th>Suggested Qty</th><th>Plan Date</th></tr></thead>
            <tbody>{rows.map((r)=> <tr key={r.id}><td>{r.itemCode}</td><td>{r.suggestedQty}</td><td>{new Date(r.planDate).toLocaleDateString()}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </main>
  )
}



