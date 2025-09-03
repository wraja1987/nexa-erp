const items = [
  { title: 'AI throughout', desc: 'Assistant bar, quick actions, token budgets, prompt masking and audit.' },
  { title: 'Billing & Subscriptions', desc: 'Plans, subscriptions, usage, invoices and Stripe health.' },
  { title: 'Open Banking', desc: 'TrueLayer OAuth, accounts and transactions with masked logs.' },
  { title: 'HMRC MTD VAT', desc: 'Obligations and returns with demo filing and audit trail.' },
  { title: 'Manufacturing (MRP/APS)', desc: 'Work orders, BOM, routing, MRP suggestions and capacity calendars.' },
  { title: 'WMS & ASN/Waves', desc: 'Inbound ASNs, wave planning, pick tasks; 3PL connectors.' },
  { title: 'Purchase Orders', desc: 'Suppliers, POs and lines; reminders and receiving.' },
  { title: 'Enterprise & Treasury', desc: 'Intercompany journals, consolidation maps, treasury movements, KPIs.' },
  { title: 'Payroll', desc: 'Schedules, runs and payslips with demo calculations.' },
  { title: 'Marketplace / EDI', desc: 'Channels, listings, external orders and shipments; sandbox sync jobs.' },
  { title: 'Notifications', desc: 'Templates and jobs; SMS/Email placeholders with Twilio.' },
  { title: 'Observability & Ops', desc: 'Health, metrics, masked logs, correlation IDs, job last runs, backups and DR drills.' },
  { title: 'Security & Governance', desc: 'RBAC/SoD, CSP/HSTS, rate limits and secret redaction by default.' },
  { title: 'Performance', desc: 'Fast pages with pagination, batched fetching and background jobs.' },
  { title: 'Mobile parity', desc: 'Expo screens for key modules; offline upload path ready.' },
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
