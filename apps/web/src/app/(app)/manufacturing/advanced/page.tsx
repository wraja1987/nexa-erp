"use client"
import { useEffect, useState } from "react"
import { AIHelperPanel } from "../../../../components/AIHelperPanel"

export default function MfgAdvancedPage() {
  const [aiOpen, setAiOpen] = useState(false)
  const [plans, setPlans] = useState<any[]>([])
  const [itemCode, setItemCode] = useState("SKU-ABC")
  const [qty, setQty] = useState<number>(10)
  const [tenantId, setTenantId] = useState("t1")
  const [msg, setMsg] = useState("")

  const loadMrp = () => fetch('/api/mfg/mrp').then(r=>r.json()).then(j=>setPlans(j.items||[])).catch(()=>{})
  useEffect(()=>{ loadMrp() },[])

  const runMrp = async () => {
    setMsg("")
    const res = await fetch('/api/mfg/mrp', { method:'POST', headers:{'content-type':'application/json','x-role':'admin','x-tenant-id':tenantId}, body: JSON.stringify({ tenantId, itemCode, qty }) })
    const j = await res.json()
    setMsg(j.ok ? 'MRP generated' : (j.message||'Failed'))
    loadMrp()
  }

  const [capDate, setCapDate] = useState<string>(new Date().toISOString().slice(0,10))
  const [capMins, setCapMins] = useState<number>(480)
  const upsertCapacity = async () => {
    const res = await fetch('/api/mfg/capacity', { method:'POST', headers:{'content-type':'application/json','x-role':'admin','x-tenant-id':tenantId}, body: JSON.stringify({ tenantId, resourceCode:'RES-1', date: capDate, availableMins: capMins }) })
    const j = await res.json(); setMsg(j.ok?'Capacity updated':(j.message||'Failed'))
  }

  const [woNum, setWoNum] = useState('WO-123')
  const [durationMins, setDurationMins] = useState<number>(90)
  const schedule = async () => {
    const res = await fetch('/api/mfg/aps', { method:'POST', headers:{'content-type':'application/json','x-role':'admin','x-tenant-id':tenantId}, body: JSON.stringify({ tenantId, workOrderNumber: woNum, durationMins }) })
    const j = await res.json(); setMsg(j.ok?'Scheduled':'Failed')
  }

  const hints = [] as { title: string; detail?: string }[]
  if (plans.length>5) hints.push({ title: 'Many MRP suggestions', detail: 'Consider batching work orders to reduce setups.' })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-semibold">Advanced Manufacturing</h1><button className="px-3 py-2 border rounded" onClick={()=>setAiOpen(true)}>AI Helper</button></div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">MRP</h2>
        <div className="flex gap-2 items-end">
          <div><label className="block text-sm" htmlFor="ic">Item</label><input id="ic" value={itemCode} onChange={e=>setItemCode(e.target.value)} className="border rounded px-2 py-1"/></div>
          <div><label className="block text-sm" htmlFor="iq">Qty</label><input id="iq" type="number" value={qty} onChange={e=>setQty(parseInt(e.target.value||'1',10))} className="border rounded px-2 py-1 w-24"/></div>
          <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={runMrp}>Run MRP</button>
        </div>
        <table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="py-2">Item</th><th className="py-2">Date</th><th className="py-2">Qty</th></tr></thead><tbody>
          {plans.map((p:any)=>(<tr key={p.id} className="border-b"><td className="py-2">{p.itemCode}</td><td className="py-2">{new Date(p.planDate).toLocaleDateString()}</td><td className="py-2">{p.suggestedQty}</td></tr>))}
          {plans.length===0 && <tr><td className="py-3" colSpan={3}>No suggestions yet.</td></tr>}
        </tbody></table>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Capacity</h2>
        <div className="flex gap-2 items-end">
          <div><label className="block text-sm" htmlFor="cd">Date</label><input id="cd" type="date" value={capDate} onChange={e=>setCapDate(e.target.value)} className="border rounded px-2 py-1"/></div>
          <div><label className="block text-sm" htmlFor="cm">Available mins</label><input id="cm" type="number" value={capMins} onChange={e=>setCapMins(parseInt(e.target.value||'0',10))} className="border rounded px-2 py-1 w-28"/></div>
          <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={upsertCapacity}>Update Capacity</button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">APS</h2>
        <div className="flex gap-2 items-end">
          <div><label className="block text-sm" htmlFor="wo">WO</label><input id="wo" value={woNum} onChange={e=>setWoNum(e.target.value)} className="border rounded px-2 py-1"/></div>
          <div><label className="block text-sm" htmlFor="dm">Duration</label><input id="dm" type="number" value={durationMins} onChange={e=>setDurationMins(parseInt(e.target.value||'0',10))} className="border rounded px-2 py-1 w-28"/></div>
          <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={schedule}>Schedule</button>
        </div>
        {msg && <div role="status" className="text-sm text-gray-700">{msg}</div>}
      </section>

      <AIHelperPanel open={aiOpen} onClose={()=>setAiOpen(false)} hints={hints} context="mfg" />
    </div>
  )
}

"use client"
import ComingSoonBadge from '../../../../components/ui/ComingSoonBadge'

export default function MfgAdvancedPage() {
  return (
    <main role="main" style={{ padding: 16 }}>
      <h1 style={{ display:'flex', alignItems:'center', gap:8 }}>Advanced Manufacturing <ComingSoonBadge /></h1>
      <p>Preview of MRP, capacity planning, and APS with demonstration data only.</p>
    </main>
  )
}



