"use client"
import { useEffect, useState } from "react"

type Obl = { periodKey: string; start: string; end: string; due: string; status: string }

export default function VatPage() {
  const [vrn, setVrn] = useState("")
  const [obls, setObls] = useState<Obl[]>([])
  const [msg, setMsg] = useState("")

  const loadObligations = async () => {
    setMsg("")
    const res = await fetch(`/api/tax/vat/mtd?vrn=${encodeURIComponent(vrn)}`, { headers: { 'x-role':'finance' }})
    const j = await res.json()
    if (!res.ok || !j.ok) setMsg(j.message || 'Failed')
    else setObls(j.obligations || [])
  }

  const submitReturn = async (periodKey: string) => {
    setMsg("")
    const body = { vrn, periodKey, totals: { vatDueSales: 0, vatDueAcquisitions: 0, totalVatDue: 0, netVatDue: 0, boxSix: 0, boxSeven: 0, boxEight: 0, boxNine: 0 } }
    const res = await fetch('/api/tax/vat/mtd', { method:'POST', headers: { 'content-type':'application/json','x-role':'finance' }, body: JSON.stringify(body) })
    const j = await res.json()
    setMsg(res.ok && j.ok ? 'Submitted' : (j.message || 'Submit failed'))
    if (res.ok && j.ok) loadObligations()
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">VAT (MTD Stub)</h1>
      {msg ? <div role="status" className="text-sm">{msg}</div> : null}
      <form className="flex gap-2" onSubmit={e=>{e.preventDefault(); loadObligations()}}>
        <div>
          <label className="block text-sm" htmlFor="vrn">VRN</label>
          <input id="vrn" className="mt-1 border rounded px-2 py-1" value={vrn} onChange={e=>setVrn(e.target.value)} required />
        </div>
        <button className="self-end px-3 py-2 rounded bg-blue-600 text-white">Load Obligations</button>
      </form>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b"><th className="py-2">Period</th><th className="py-2">Due</th><th className="py-2">Status</th><th className="py-2">Action</th></tr>
        </thead>
        <tbody>
          {obls.map(o=> (
            <tr key={o.periodKey} className="border-b">
              <td className="py-2">{o.periodKey} — {new Date(o.start).toLocaleDateString()} to {new Date(o.end).toLocaleDateString()}</td>
              <td className="py-2">{new Date(o.due).toLocaleDateString()}</td>
              <td className="py-2">{o.status}</td>
              <td className="py-2"><button className="px-2 py-1 rounded bg-gray-200" onClick={()=>submitReturn(o.periodKey)} disabled={o.status.toLowerCase()==='fulfilled'}>Submit</button></td>
            </tr>
          ))}
          {obls.length===0 ? <tr><td className="py-4" colSpan={4}>No obligations</td></tr> : null}
        </tbody>
      </table>
    </main>
  )
}






