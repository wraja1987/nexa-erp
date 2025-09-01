"use client"
import ComingSoonBadge from '../../../components/ui/ComingSoonBadge'

export default function MarketplacePage() {
  const tiles = [ 'Shopify Connector', 'Xero Export', 'Open Banking', 'HMRC MTD' ]
  return (
    <main role="main" style={{ padding: 16 }}>
      <h1 style={{ display:'flex', alignItems:'center', gap:8 }}>Marketplace <ComingSoonBadge /></h1>
      <p>Preview of future apps available for Nexa ERP. This is a safe demonstration only.</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:12 }}>
        {tiles.map(t => (
          <div key={t} style={{ border:'1px solid #eaecef', borderRadius:8, padding:12 }}>
            <strong>{t}</strong>
            <div style={{ marginTop:8 }}><button disabled title="Mocked">View</button></div>
          </div>
        ))}
      </div>
    </main>
  )
}


