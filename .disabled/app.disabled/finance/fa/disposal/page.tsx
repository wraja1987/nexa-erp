"use client"
import { useState } from "react"

export default function AssetDisposalPage() {
  const [assetId, setAssetId] = useState("")
  const [disposedAt, setDisposedAt] = useState("")
  const [proceeds, setProceeds] = useState(0)
  const [notes, setNotes] = useState("")
  const [msg, setMsg] = useState("")

  const onSubmit = async () => {
    setMsg("")
    const res = await fetch('/api/finance/fa/disposal', { method:'POST', headers:{ 'content-type':'application/json','x-role':'finance' }, body: JSON.stringify({ tenantId:'t1', assetId, disposedAt, proceeds: Number(proceeds), notes }) })
    const j = await res.json()
    setMsg(res.ok && j.ok ? `Disposed. Gain/Loss: ${j.gainLoss}` : (j.message || 'Failed'))
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Fixed Asset Disposal</h1>
      {msg ? <div role="status" className="text-sm">{msg}</div> : null}
      <form className="max-w-md space-y-3" onSubmit={e=>{e.preventDefault(); onSubmit()}}>
        <div>
          <label className="block text-sm" htmlFor="aid">Asset ID</label>
          <input id="aid" className="mt-1 w-full border rounded px-2 py-1" value={assetId} onChange={e=>setAssetId(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm" htmlFor="dt">Disposed At</label>
          <input id="dt" type="date" className="mt-1 w-full border rounded px-2 py-1" value={disposedAt} onChange={e=>setDisposedAt(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm" htmlFor="pr">Proceeds</label>
          <input id="pr" type="number" step="0.01" className="mt-1 w-full border rounded px-2 py-1" value={proceeds} onChange={e=>setProceeds(Number(e.target.value))} required />
        </div>
        <div>
          <label className="block text-sm" htmlFor="nt">Notes</label>
          <input id="nt" className="mt-1 w-full border rounded px-2 py-1" value={notes} onChange={e=>setNotes(e.target.value)} />
        </div>
        <button className="px-3 py-2 rounded bg-blue-600 text-white">Dispose</button>
      </form>
    </main>
  )
}






