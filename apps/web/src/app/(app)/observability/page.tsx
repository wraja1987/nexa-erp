"use client"
import { useEffect, useState } from 'react'

type Audit = { time?: string; actorId?: string; action?: string; status?: string; module?: string }

export default function ObservabilityPage() {
  const [items, setItems] = useState<Audit[]>([])
  const [module, setModule] = useState('')
  const [action, setAction] = useState('')

  const load = async () => {
    const qs = new URLSearchParams()
    if (module) qs.set('module', module)
    if (action) qs.set('action', action)
    const res = await fetch(`/api/observability/audit?${qs.toString()}`, { headers: { 'x-role': 'superadmin' } })
    const j = await res.json()
    setItems(j.items || [])
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Observability</h1>
      <div className="flex gap-2 mb-4">
        <input aria-label="Module filter" value={module} onChange={e=>setModule(e.target.value)} className="border p-2" placeholder="module" />
        <input aria-label="Action filter" value={action} onChange={e=>setAction(e.target.value)} className="border p-2" placeholder="action" />
        <button onClick={load} className="px-3 py-2 border rounded">Apply</button>
      </div>
      <table className="w-full text-sm">
        <thead><tr><th className="text-left p-2">Time</th><th className="text-left p-2">Actor</th><th className="text-left p-2">Module</th><th className="text-left p-2">Action</th><th className="text-left p-2">Status</th></tr></thead>
        <tbody>
          {items.map((it, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-2">{it.time}</td>
              <td className="p-2">{it.actorId || '—'}</td>
              <td className="p-2">{it.module || '—'}</td>
              <td className="p-2">{it.action}</td>
              <td className="p-2">{it.status || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


