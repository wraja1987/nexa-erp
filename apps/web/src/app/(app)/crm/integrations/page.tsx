"use client"
import { useEffect, useState } from "react"
import { AIHelperPanel } from "../../../../components/AIHelperPanel"

export default function CrmIntegrationsPage() {
  const [status, setStatus] = useState<{configured:boolean}>({configured:false})
  const [aiOpen, setAiOpen] = useState(false)
  const [lastSync, setLastSync] = useState<string>("")
  const [counts, setCounts] = useState<{contacts:number; deals:number}>({contacts:0, deals:0})

  useEffect(()=>{ fetch('/api/crm/hubspot/status').then(r=>r.json()).then(j=>setStatus({configured: !!j.configured})).catch(()=>{}) },[])

  const sync = async () => {
    const res = await fetch('/api/crm/hubspot/sync', { method:'POST', headers:{'content-type':'application/json','x-role':'admin'}, body: JSON.stringify({}) })
    const j = await res.json();
    setLastSync(new Date().toISOString());
    setCounts({ contacts:(j.synced?.contacts||0), deals:(j.synced?.deals||0) })
  }

  const hints = [] as {title:string; detail?:string}[]
  if (!status.configured) hints.push({ title: 'HubSpot not configured', detail: 'Add client id/secret to enable deep sync.' })

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">CRM Integrations</h1>
        <button className="px-3 py-2 border rounded" onClick={()=>setAiOpen(true)}>AI Helper</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">HubSpot Connection</div>
            <span className={`px-2 py-1 rounded text-xs ${status.configured?'bg-green-100 text-green-800':'bg-gray-100 text-gray-700'}`}>{status.configured?'Configured':'Not Configured'}</span>
          </div>
          <div className="text-sm text-gray-700 mt-2">If not configured, set HUBSPOT_CLIENT_ID/SECRET and restart.</div>
        </div>
        <div className="border rounded p-4">
          <div className="font-medium mb-2">Sync Controls</div>
          <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={sync} disabled={!status.configured}>Sync Contacts & Deals</button>
          <div className="text-sm text-gray-700 mt-2">Last sync: {lastSync || '-'}</div>
          <div className="text-sm text-gray-700">Contacts: {counts.contacts} Deals: {counts.deals}</div>
        </div>
      </div>
      <AIHelperPanel open={aiOpen} onClose={()=>setAiOpen(false)} hints={hints} context="crm" />
    </div>
  )
}

"use client"
import ComingSoonBadge from '../../../../components/ui/ComingSoonBadge'

export default function CrmIntegrationsPage() {
  return (
    <main role="main" style={{ padding: 16 }}>
      <h1 style={{ display:'flex', alignItems:'center', gap:8 }}>Advanced CRM Integrations <ComingSoonBadge /></h1>
      <p>Connect Email, Calendar, and Dialler in a safe mocked mode. No external calls are made.</p>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:8 }}>
        <button disabled title="Mocked">Connect Google</button>
        <button disabled title="Mocked">Connect Microsoft 365</button>
        <button disabled title="Mocked">Connect Twilio Dialler</button>
      </div>
      <section aria-labelledby="ai-help" style={{ marginTop:16, padding:12, border:'1px solid #eaecef', borderRadius:8 }}>
        <h2 id="ai-help">What Nexa AI will do here</h2>
        <ul>
          <li>Summarise call outcomes and draft follow-ups.</li>
          <li>Propose meeting slots based on calendars.</li>
          <li>Highlight high-priority leads from interactions.</li>
        </ul>
      </section>
    </main>
  )
}



