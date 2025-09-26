"use client"
import ComingSoonBadge from '../../../components/ui/ComingSoonBadge'
import AIHelperBar from '../../components/AIHelperBar'

export default function BillingPage() {
  const configured = !!process.env.STRIPE_SECRET_KEY
  const plans = [
    { name:'Free', price:'£0', features:['1 user','Basic'] },
    { name:'Standard', price:'£49', features:['5 users','Core'] },
    { name:'Professional', price:'£149', features:['25 users','Advanced'] },
    { name:'Enterprise', price:'Custom', features:['Unlimited','SLA'] },
  ]
  return (
    <main role="main" style={{ padding: 16 }}>
      <h1 style={{ display:'flex', alignItems:'center', gap:8 }}>Billing & Metering <ComingSoonBadge /></h1>
      <p><span style={{ padding:'2px 8px', borderRadius: 12, background: configured ? '#e6f4ea' : '#fdecea', color: configured ? '#1e4620' : '#8a1f11' }}>{configured ? 'Configured' : 'Not configured'}</span></p>
      <p>Plan overview with mocked subscribe buttons and demo usage counters.</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:12 }}>
        {plans.map(p => (
          <div key={p.name} style={{ border:'1px solid #eaecef', borderRadius:8, padding:12 }}>
            <strong>{p.name}</strong>
            <div>{p.price}/mo</div>
            <ul>{p.features.map(f=> <li key={f}>{f}</li>)}</ul>
            <button disabled title="Mocked">Subscribe</button>
          </div>
        ))}
      </div>
      <section aria-labelledby="usage" style={{ marginTop:16 }}>
        <h2 id="usage">Usage/Metering</h2>
        <p>API calls this month: 1,234 (demo)</p>
      </section>
      <AIHelperBar />
    </main>
  )
}



