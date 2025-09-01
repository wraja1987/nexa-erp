import ComingSoonBadge from '../../../components/ui/ComingSoonBadge'

export default function WmsAdvancedPage() {
  return (
    <main role="main" style={{ padding: 16 }}>
      <h1 style={{ display:'flex', alignItems:'center', gap:8 }}>Advanced WMS <ComingSoonBadge /></h1>
      <p>Preview of advanced warehouse flows including ASN, wave picking, and 3PL connectors.</p>
      <div role="status" aria-live="polite" style={{ background:'#fff6d6', padding:12, borderRadius:8, margin:'12px 0' }}>
        This module is coming soon. Live features will include advanced putaway, waves, and integrations.
      </div>
    </main>
  )
}


