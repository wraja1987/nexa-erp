"use client"
import { useState } from 'react'
import ComingSoonBadge from '../../../../components/ui/ComingSoonBadge'
import { connect, disconnect, isConnected, ConnectorKey } from '../../../../lib/connectors/mockConnectorService'
import { connectorStatus } from '@nexa/registry'
import AIHelperBar from '../../../components/AIHelperBar'
import { useEffect } from 'react'

const cards: { key: ConnectorKey; label: string }[] = [
  { key: 'google', label: 'Google' },
  { key: 'microsoft', label: 'Microsoft 365' },
  { key: 'twilio', label: 'Twilio' },
  { key: 'stripe', label: 'Stripe' },
  { key: 'open-banking', label: 'Open Banking' },
  { key: 'hmrc', label: 'HMRC' },
]

export default function ConnectorsPage() {
  const [tick, setTick] = useState(0)
  const [jobs, setJobs] = useState<Record<string, { lastRun: string; outcome: 'success' | 'error' }>>({})
  useEffect(() => {
    fetch('/api/jobs/status').then(r=>r.json()).then(j=>{ if (j?.data) setJobs(j.data) }).catch(()=>{})
  }, [tick])
  const onToggle = async (key: ConnectorKey) => {
    const is = isConnected(key)
    if (is) await disconnect(key); else await connect(key)
    setTick(t => t + 1)
  }
  return (
    <main role="main" style={{ padding: 16 }}>
      <h1 style={{ display:'flex', alignItems:'center', gap:8 }}>Connectors <ComingSoonBadge /></h1>
      <p>Central control for connectors in demo mode. Actions are mocked and logged.</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:12 }}>
        {cards.map(c => {
          const connected = isConnected(c.key)
          const status = ((): 'Configured' | 'Not configured' => {
            switch (c.key) {
              case 'stripe': return connectorStatus('stripe') === 'active' ? 'Configured' : 'Not configured'
              case 'open-banking': return connectorStatus('open_banking') === 'active' ? 'Configured' : 'Not configured'
              case 'hmrc': return connectorStatus('hmrc') === 'active' ? 'Configured' : 'Not configured'
              case 'twilio': return connectorStatus('twilio') === 'active' ? 'Configured' : 'Not configured'
              default: return 'Not configured'
            }
          })()
          return (
            <div key={c.key} style={{ border:'1px solid #eaecef', borderRadius:8, padding:12 }}>
              <strong>{c.label}</strong>
              <div style={{ marginTop:6 }}><span style={{ padding:'2px 8px', borderRadius: 12, background: status==='Configured' ? '#e6f4ea' : '#fdecea', color: status==='Configured' ? '#1e4620' : '#8a1f11' }}>{status}</span></div>
              <div style={{ marginTop:8, display:'flex', gap:8, alignItems:'center' }}>
                <button onClick={()=>onToggle(c.key)}>{connected ? 'Disconnect' : 'Connect'}</button>
                {connected && <span role="status" aria-live="polite" style={{ color:'#2e7d32' }}>Connected (Demo)</span>}
                <button onClick={async()=>{ await fetch(`/api/${c.key.replace('open-banking','open-banking/health').replace('hmrc','hmrc/vat/obligations').replace('stripe','stripe/health')}`).then(()=>setTick(t=>t+1)) }}>Test connection</button>
                <small style={{ marginLeft:8, color:'#6b7280' }}>Last jobs run: {Object.keys(jobs).length ? 'see status below' : 'never'}</small>
              </div>
              <div style={{ marginTop:6, fontSize:12, color:'#374151' }}>
                <div>Jobs status:</div>
                <ul>
                  {Object.entries(jobs).map(([k,v])=> (<li key={k}>{k}: {v.outcome} at {v.lastRun}</li>))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
      <AIHelperBar />
    </main>
  )
}



