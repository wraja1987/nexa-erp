const items = [
  { title: 'AI throughout', desc: 'Assistant bar with context suggestions and safe prompt masking.' },
  { title: 'Governance & RBAC', desc: 'Roles, Separation of Duties and access guards across modules and APIs.' },
  { title: 'Security by default', desc: 'CSP, HSTS, X-Content-Type-Options, rate limiting and secret masking.' },
  { title: 'Observability & Ops', desc: 'Health, metrics, masked logs, correlation IDs, job last runs, backups and DR drills.' },
  { title: 'Performance', desc: 'Fast pages with pagination, batched fetching and background jobs.' },
  { title: 'Integrations', desc: 'Stripe, TrueLayer, HMRC VAT, Twilio, Amazon/eBay/Shopify (mocks/sandbox).'},
]

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="card p-5 h-full">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-slate-600 text-sm mt-1">{desc}</p>
    </div>
  )
}

export default function FeaturesPage() {
  return (
    <div className="space-y-6">
      <header className="mt-8">
        <h1 className="text-3xl font-semibold">Features</h1>
        <p className="text-slate-600 mt-2">Cross-cutting capabilities you get with Nexa from day one.</p>
      </header>
      <div className="grid md:grid-cols-3 gap-6">
        {items.map(i => <Card key={i.title} title={i.title} desc={i.desc} />)}
      </div>
    </div>
  )
}
