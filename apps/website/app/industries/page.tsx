type Sector = { name: string; value: string[] }

const sectors: Sector[] = [
  { name: 'Retail', value: ['Unified inventory & sales', 'Omnichannel orders', 'Replenishment insights'] },
  { name: 'Manufacturing', value: ['MRP & capacity planning', 'Work orders & routing', 'Supplier POs & receiving'] },
  { name: 'SaaS', value: ['Subscriptions & usage metering', 'Billing & dunning', 'Revenue snapshots'] },
  { name: 'Logistics', value: ['WMS waves & picks', '3PL connectors', 'ASN & receiving'] },
  { name: 'Construction', value: ['Project cost tracking', 'PO approvals', 'Material logistics'] },
  { name: 'Professional Services', value: ['Timesheets & invoicing', 'Expense control', 'KPI snapshots'] },
]

export default function IndustriesPage() {
  return (
    <div className="space-y-8">
      <section className="mt-8">
        <div className="hero-band">
          <h1 className="text-3xl md:text-4xl font-semibold">Industries</h1>
          <p className="mt-2 opacity-90">Built for every industry: Wholesale & Distribution, Manufacturing & Supply Chain, Retail & eCommerce, Services & SaaS.</p>
          <div className="mt-4">
            <a href="/contact#demo" className="btn-primary">Book a discovery call</a>
          </div>
        </div>
      </section>
      <div className="grid md:grid-cols-3 gap-6">
        {sectors.map((s)=> (
          <div key={s.name} className="card p-5">
            <h3 className="font-semibold mb-2">{s.name}</h3>
            <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
              {s.value.map(v => <li key={v}>{v}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="pt-2">
        <a href="/contact#demo" className="btn-secondary">Talk to an expert</a>
      </div>
    </div>
  )
}
