"use client"
import { useEffect, useState } from "react"
import { AIHelperPanel } from "../../../../components/AIHelperPanel"

export default function WmsAdvancedPage() {
  const [tab, setTab] = useState<'asn'|'putaway'|'waves'|'picks'>('asn')
  const [aiOpen, setAiOpen] = useState(false)
  const [asn, setAsn] = useState<any[]>([])
  const [waves, setWaves] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/wms/asn').then(r=>r.json()).then(j=>setAsn(j.data||[])).catch(()=>{})
    fetch('/api/wms/waves').then(r=>r.json()).then(j=>setWaves(j.data||[])).catch(()=>{})
  }, [])

  const hints = [] as { title: string; detail?: string }[]
  if (tab === 'waves' && waves.length) hints.push({ title: 'Consider grouping small orders in same zone', detail: 'Reduce travel time by batching picks per zone.' })
  if (tab === 'asn' && asn.length === 0) hints.push({ title: 'No ASNs yet', detail: 'Create an ASN to start receiving inbound goods.' })

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Advanced WMS</h1>
        <button className="px-3 py-2 border rounded" onClick={()=>setAiOpen(true)}>AI Helper</button>
      </div>
      <nav className="flex gap-2">
        {(['asn','putaway','waves','picks'] as const).map(t => (
          <button key={t} className={`px-3 py-2 rounded ${tab===t?'bg-blue-600 text-white':'bg-gray-200'}`} onClick={()=>setTab(t)}>{t.toUpperCase()}</button>
        ))}
      </nav>

      {tab==='asn' && <AsnPanel onCreated={(row)=>setAsn([row, ...asn])} rows={asn} />}
      {tab==='putaway' && <PutawayPanel />}
      {tab==='waves' && <WavesPanel onCreated={(row)=>setWaves([row, ...waves])} rows={waves} />}
      {tab==='picks' && <PicksPanel waves={waves} />}

      <AIHelperPanel open={aiOpen} onClose={()=>setAiOpen(false)} hints={hints} context="wms" />
    </div>
  )
}

function AsnPanel({ rows, onCreated }: { rows: any[]; onCreated: (r:any)=>void }) {
  const [number, setNumber] = useState("")
  const [tenantId, setTenantId] = useState("t1")
  const create = async () => {
    const res = await fetch('/api/wms/asn', { method:'POST', headers:{'content-type':'application/json','x-role':'admin'}, body: JSON.stringify({ number, tenantId }) })
    const j = await res.json()
    if (j.ok) { onCreated(j.data) ; setNumber("") }
  }
  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-end">
        <div>
          <label htmlFor="asnNo" className="block text-sm">ASN Number</label>
          <input id="asnNo" value={number} onChange={e=>setNumber(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <div>
          <label htmlFor="asnTid" className="block text-sm">Tenant</label>
          <input id="asnTid" value={tenantId} onChange={e=>setTenantId(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={create}>Create ASN</button>
      </div>
      <table className="w-full text-sm">
        <thead><tr className="text-left border-b"><th className="py-2">Number</th><th className="py-2">Status</th><th className="py-2">Created</th></tr></thead>
        <tbody>
          {rows.map(r => <tr key={r.id} className="border-b"><td className="py-2">{r.number}</td><td className="py-2">{r.status}</td><td className="py-2">{new Date(r.createdAt).toLocaleString()}</td></tr>)}
          {rows.length===0 && <tr><td className="py-3" colSpan={3}>No ASNs.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

function PutawayPanel() {
  const [tenantId, setTenantId] = useState("t1")
  const [sku, setSku] = useState("")
  const [qty, setQty] = useState<number>(1)
  const [msg, setMsg] = useState("")
  const put = async () => {
    setMsg("")
    const res = await fetch('/api/wms/putaway', { method:'POST', headers:{'content-type':'application/json','x-role':'admin'}, body: JSON.stringify({ tenantId, itemSku: sku, qty }) })
    const j = await res.json()
    setMsg(j.ok ? 'Putaway updated' : (j.message||'Failed'))
  }
  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-end">
        <div><label htmlFor="sku" className="block text-sm">SKU</label><input id="sku" value={sku} onChange={e=>setSku(e.target.value)} className="border rounded px-2 py-1" /></div>
        <div><label htmlFor="qty" className="block text-sm">Qty</label><input id="qty" type="number" value={qty} onChange={e=>setQty(parseInt(e.target.value||'1',10))} className="border rounded px-2 py-1 w-24" /></div>
        <div><label htmlFor="tid" className="block text-sm">Tenant</label><input id="tid" value={tenantId} onChange={e=>setTenantId(e.target.value)} className="border rounded px-2 py-1 w-28" /></div>
        <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={put}>Putaway</button>
      </div>
      {msg && <div role="status" className="text-sm text-gray-700">{msg}</div>}
    </div>
  )
}

function WavesPanel({ rows, onCreated }: { rows:any[]; onCreated:(r:any)=>void }) {
  const [number, setNumber] = useState("")
  const [tenantId, setTenantId] = useState("t1")
  const create = async () => {
    const res = await fetch('/api/wms/waves', { method:'POST', headers:{'content-type':'application/json','x-role':'admin'}, body: JSON.stringify({ number, tenantId }) })
    const j = await res.json()
    if (j.ok) { onCreated(j.data); setNumber("") }
  }
  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-end">
        <div><label htmlFor="wv" className="block text-sm">Wave Number</label><input id="wv" value={number} onChange={e=>setNumber(e.target.value)} className="border rounded px-2 py-1" /></div>
        <div><label htmlFor="wvt" className="block text-sm">Tenant</label><input id="wvt" value={tenantId} onChange={e=>setTenantId(e.target.value)} className="border rounded px-2 py-1 w-28" /></div>
        <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={create}>Create Wave</button>
      </div>
      <table className="w-full text-sm">
        <thead><tr className="text-left border-b"><th className="py-2">Number</th><th className="py-2">Status</th><th className="py-2">Tasks</th></tr></thead>
        <tbody>
          {rows.map(r => <tr key={r.id} className="border-b"><td className="py-2">{r.number}</td><td className="py-2">{r.status}</td><td className="py-2">{(r.pickTasks||[]).length}</td></tr>)}
          {rows.length===0 && <tr><td className="py-3" colSpan={3}>No waves.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

function PicksPanel({ waves }: { waves:any[] }) {
  const allTasks = waves.flatMap((w:any)=>w.pickTasks||[])
  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-700">Tasks: {allTasks.length}</div>
      <table className="w-full text-sm">
        <thead><tr className="text-left border-b"><th className="py-2">SKU</th><th className="py-2">Qty</th></tr></thead>
        <tbody>
          {allTasks.map((t:any)=> <tr key={t.id} className="border-b"><td className="py-2">{t.sku}</td><td className="py-2">{t.qty}</td></tr>)}
          {allTasks.length===0 && <tr><td className="py-3" colSpan={2}>No pick tasks.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

"use client"
import ComingSoonBadge from '../../../../components/ui/ComingSoonBadge'

export default function WmsAdvancedPage() {
  return (
    <main role="main" style={{ padding: 16 }}>
      <h1 style={{ display:'flex', alignItems:'center', gap:8 }}>Advanced WMS <ComingSoonBadge /></h1>
      <p>Preview of advanced warehouse flows including ASN, wave picking, and 3PL connectors.</p>
      <div role="status" aria-live="polite" style={{ background:'#fff6d6', padding:12, borderRadius:8, margin:'12px 0' }}>
        This module is coming soon. Live features will include advanced putaway, waves, and integrations.
      </div>
    </main>
  )
}



