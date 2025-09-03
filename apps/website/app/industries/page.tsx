type Sector = { name: string; value: string[] }

const sectors: Sector[] = [
  { name: 'Retail', value: ['Unified inventory', 'Omnichannel orders', 'Replenishment insights'] },
  { name: 'Manufacturing', value: ['MRP & capacity', 'Work orders & routing', 'Supplier POs'] },
  { name: 'SaaS', value: ['Subscriptions & usage', 'Billing & dunning', 'Revenue insights'] },
  { name: 'Logistics', value: ['WMS waves & picks', '3PL connectors', 'ASN & receiving'] },
  { name: 'Construction', value: ['Project cost tracking', 'PO approvals', 'Material logistics'] },
  { name: 'Professional Services', value: ['Timesheets & invoicing', 'Expense control', 'KPI snapshots'] },
]

export default function IndustriesPage() {
  return (
    <div className="space-y-6">
      <header className="mt-8">
        <h1 className="text-3xl font-semibold">Industries</h1>
        <p className="text-slate-600 mt-2">Proven patterns that fit how your sector operates.</p>
      </header>
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
    </div>
  )
}
