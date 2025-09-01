import ComingSoonBadge from '../../../components/ui/ComingSoonBadge'

export default function CapacityPage() {
  const rows = [ { workCenter:'WC-1', utilisation:0.72 }, { workCenter:'WC-2', utilisation:0.58 } ]
  return (
    <main role="main" style={{ padding: 16 }}>
      <h1 style={{ display:'flex', alignItems:'center', gap:8 }}>Capacity Planning <ComingSoonBadge /></h1>
      <p>Preview of work center utilisation based on demonstration data.</p>
      <div style={{overflowX:'auto'}}>
        <table role="table" aria-label="Capacity"><thead><tr><th>Work Center</th><th>Utilisation</th></tr></thead>
          <tbody>{rows.map((r,i)=> <tr key={i}><td>{r.workCenter}</td><td>{Math.round(r.utilisation*100)}%</td></tr>)}</tbody>
        </table>
      </div>
    </main>
  )
}


