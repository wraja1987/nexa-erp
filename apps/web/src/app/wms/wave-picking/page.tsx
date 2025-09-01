import ComingSoonBadge from '../../../components/ui/ComingSoonBadge'

export default function WmsWavePickingPage() {
  const rows = [ { wave:'W-12', orders: 5, picker:'J. Smith' }, { wave:'W-13', orders: 8, picker:'L. Brown' } ]
  return (
    <main role="main" style={{ padding: 16 }}>
      <h1 style={{ display:'flex', alignItems:'center', gap:8 }}>WMS Wave Picking <ComingSoonBadge /></h1>
      <p>Demo of wave picking assignments and batch size. All actions are mocked.</p>
      <div style={{overflowX:'auto'}}>
        <table role="table" aria-label="Wave picking"><thead><tr><th>Wave</th><th>Orders</th><th>Picker</th></tr></thead>
          <tbody>{rows.map((r,i)=> <tr key={i}><td>{r.wave}</td><td>{r.orders}</td><td>{r.picker}</td></tr>)}</tbody>
        </table>
      </div>
    </main>
  )
}


