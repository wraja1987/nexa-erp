"use client"
import { useEffect, useState } from "react"

type Insp = { id: string; docType: string; docId: string; status: string }
type Hold = { id: string; sku?: string; reason: string; status: string }
type Capa = { id: string; title: string; status: string }

export default function QualityPage() {
  const [insp, setInsp] = useState<Insp[]>([])
  const [holds, setHolds] = useState<Hold[]>([])
  const [capas, setCapas] = useState<Capa[]>([])
  const [msg, setMsg] = useState("")

  const loadAll = async () => {
    setMsg("")
    const [i, h, c] = await Promise.all([
      fetch('/api/quality/inspections', { headers:{ 'x-role':'wms' }}).then(r=>r.json()).catch(()=>({items:[]})),
      fetch('/api/quality/holds', { headers:{ 'x-role':'wms' }}).then(r=>r.json()).catch(()=>({items:[]})),
      fetch('/api/quality/capa', { headers:{ 'x-role':'wms' }}).then(r=>r.json()).catch(()=>({items:[]}))
    ])
    setInsp(i.items||[]); setHolds(h.items||[]); setCapas(c.items||[])
  }
  useEffect(()=>{ loadAll() }, [])

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Quality</h1>
      {msg ? <div role="status" className="text-sm">{msg}</div> : null}
      <section>
        <h2 className="text-lg font-medium mb-2">Inspections</h2>
        <table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="py-2">Doc</th><th className="py-2">Status</th></tr></thead><tbody>
          {insp.map(x=> <tr key={x.id} className="border-b"><td className="py-2">{x.docType} {x.docId}</td><td className="py-2">{x.status}</td></tr>)}
          {insp.length===0 ? <tr><td className="py-4" colSpan={2}>No inspections</td></tr> : null}
        </tbody></table>
      </section>
      <section>
        <h2 className="text-lg font-medium mb-2">Holds</h2>
        <table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="py-2">SKU</th><th className="py-2">Reason</th><th className="py-2">Status</th></tr></thead><tbody>
          {holds.map(x=> <tr key={x.id} className="border-b"><td className="py-2">{x.sku||'-'}</td><td className="py-2">{x.reason}</td><td className="py-2">{x.status}</td></tr>)}
          {holds.length===0 ? <tr><td className="py-4" colSpan={3}>No holds</td></tr> : null}
        </tbody></table>
      </section>
      <section>
        <h2 className="text-lg font-medium mb-2">CAPA</h2>
        <table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="py-2">Title</th><th className="py-2">Status</th></tr></thead><tbody>
          {capas.map(x=> <tr key={x.id} className="border-b"><td className="py-2">{x.title}</td><td className="py-2">{x.status}</td></tr>)}
          {capas.length===0 ? <tr><td className="py-4" colSpan={2}>No CAPA records</td></tr> : null}
        </tbody></table>
      </section>
    </main>
  )
}






