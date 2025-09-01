"use client"
import { useState } from 'react'
import ComingSoonBadge from '../../../../components/ui/ComingSoonBadge'
import { connect, disconnect, isConnected, ConnectorKey } from '../../../../lib/connectors/mockConnectorService'

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
          return (
            <div key={c.key} style={{ border:'1px solid #eaecef', borderRadius:8, padding:12 }}>
              <strong>{c.label}</strong>
              <div style={{ marginTop:8, display:'flex', gap:8 }}>
                <button onClick={()=>onToggle(c.key)}>{connected ? 'Disconnect' : 'Connect'}</button>
                {connected && <span role="status" aria-live="polite" style={{ color:'#2e7d32' }}>Connected (Demo)</span>}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}


