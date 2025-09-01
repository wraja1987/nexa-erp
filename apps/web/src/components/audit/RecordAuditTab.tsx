"use client"
import { useMemo } from 'react'

export type AuditEvent = { at: string; who: string; action: string; details?: string }

export default function RecordAuditTab({ entity, entityId, events }: { entity: string; entityId: string; events?: AuditEvent[] }) {
  const demo: AuditEvent[] = useMemo(() => events ?? [
    { at: new Date().toISOString(), who: 'demo@tenant', action: 'view', details: 'Viewed record' },
    { at: new Date(Date.now() - 3600_000).toISOString(), who: 'demo@tenant', action: 'create' },
  ], [events])

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ entity, entityId, events: demo }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download=`audit-${entity}-${entityId}.json`; a.click(); URL.revokeObjectURL(url)
  }
  const exportCsv = () => {
    const header = 'at,who,action,details\n'
    const body = demo.map(e=>`${e.at},${e.who},${e.action},${(e.details||'').replaceAll(',', ';')}`).join('\n')
    const blob = new Blob([header+body], { type:'text/csv' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=`audit-${entity}-${entityId}.csv`; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <section aria-labelledby="audit-tab" style={{ border:'1px solid #eaecef', borderRadius:8, padding:12 }}>
      <h2 id="audit-tab" style={{ marginTop:0 }}>Audit trail</h2>
      <p style={{ marginTop:0 }}>Entity: <strong>{entity}</strong> — ID: <strong>{entityId}</strong></p>
      <div style={{ overflowX:'auto' }}>
        <table role="table" aria-label="Audit events" style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Details</th></tr></thead>
          <tbody>
            {demo.map((e,i)=> <tr key={i}><td>{e.at}</td><td>{e.who}</td><td>{e.action}</td><td>{e.details||''}</td></tr>)}
          </tbody>
        </table>
      </div>
      <div style={{ display:'flex', gap:8, marginTop:8 }}>
        <button onClick={exportJson}>Export JSON</button>
        <button onClick={exportCsv}>Export CSV</button>
      </div>
      <div style={{ marginTop:8, fontStyle:'italic' }}>In short: This record has 2 demo events. Live audit will summarise changes and access.</div>
    </section>
  )}


