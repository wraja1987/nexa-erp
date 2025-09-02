"use client"
import ComingSoonBadge from '../../../../components/ui/ComingSoonBadge'

export default function Wms3plPage() {
  const rows = [ { name:'ShipBob', status:'Available' }, { name:'Shippo', status:'Available' } ]
  return (
    <main role="main" style={{ padding: 16 }}>
      <h1 style={{ display:'flex', alignItems:'center', gap:8 }}>3PL Connectors <ComingSoonBadge /></h1>
      <p>Future connectors to third-party logistics providers. These are placeholders only.</p>
      <div style={{overflowX:'auto'}}>
        <table role="table" aria-label="3PL connectors"><thead><tr><th>Name</th><th>Status</th></tr></thead>
          <tbody>{rows.map((r,i)=> <tr key={i}><td>{r.name}</td><td>{r.status}</td></tr>)}</tbody>
        </table>
      </div>
      <button disabled title="Mocked" style={{ marginTop:12 }}>Connect 3PL (Mocked)</button>
    </main>
  )
}



