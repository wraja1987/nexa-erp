type Mod = { name: string; status: 'Active' | 'Coming Soon'; desc: string }

const modules: Mod[] = [
  { name: 'Billing & Metering (Stripe)', status: 'Active', desc: 'Plans, subscriptions, usage events and invoices with Stripe integrations.' },
  { name: 'Open Banking (TrueLayer)', status: 'Active', desc: 'OAuth, accounts and transactions; sandbox-first with masked logs.' },
  { name: 'HMRC MTD VAT', status: 'Active', desc: 'Obligations and returns APIs; demo filing and audit trail.' },
  { name: 'Manufacturing (MRP/APS/Capacity)', status: 'Active', desc: 'Work orders, BOM, routing, MRP and capacity calendars.' },
  { name: 'WMS (ASN/Waves/Picks)', status: 'Active', desc: 'Inbound ASNs, wave planning and pick tasks; 3PL connectors.' },
  { name: 'Purchase Orders', status: 'Active', desc: 'Suppliers, POs and lines; reminders and receiving.' },
  { name: 'Enterprise (Intercompany/Treasury)', status: 'Active', desc: 'Intercompany journals, consolidation maps, treasury movements and KPIs.' },
  { name: 'Payroll', status: 'Active', desc: 'Schedules, runs and payslips; demo calculations.' },
  { name: 'Marketplace / EDI', status: 'Active', desc: 'Channels, listings, external orders and shipments; demo sync jobs.' },
  { name: 'Notifications', status: 'Active', desc: 'Templates and jobs; SMS/Email placeholders with Twilio.' },
]

function Badge({ text, tone='blue' }: { text: string; tone?: 'blue'|'slate' }) {
  const cls = tone === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-700 border-slate-200'
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${cls}`}>{text}</span>
}

export default function SolutionsPage() {
  return (
    <div className="space-y-8">
      <header className="mt-8">
        <h1 className="text-3xl font-semibold">Solutions</h1>
        <p className="text-slate-600 mt-2">Everything you need to run finance and operations — with AI in every module.</p>
      </header>
      <div className="grid md:grid-cols-2 gap-6">
        {modules.map((m) => (
          <div key={m.name} className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold">{m.name}</h3>
              <Badge text={m.status} />
            </div>
            <p className="text-slate-600 text-sm mt-2">{m.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
