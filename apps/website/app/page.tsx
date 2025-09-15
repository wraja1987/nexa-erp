import { FinanceIcon, WmsIcon, ManufacturingIcon, AiIcon, AnalyticsIcon, ConnectorsIcon, StripeIcon, TrueLayerIcon, HmrcMtdIcon, ShopifyIcon, AmazonIcon, TwilioIcon } from "@/components/Icons";

function Feature({ title, desc, icon }: { title: string; desc: string; icon?: React.ReactNode }) {
  return (
    <div className="card p-5 h-full">
      <div className="flex items-start gap-3">
        {icon}
        <div>
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="section">
        <div className="hero-band">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                Smarter. Faster. More Secure.
              </h1>
              <p className="mt-4 text-lg opacity-90">
                Nexa is an AI‑powered ERP that brings finance, operations, and manufacturing together so you can run a tighter, more predictable business.
              </p>
              <div className="mt-6 flex gap-3">
                <a href="/contact#demo" className="btn-primary">Get a demo</a>
                <a href="/solutions" className="btn-ghost">Explore solutions</a>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden ring-1 ring-white/15 shadow-lg">
                <img src="/hero-nexa.svg" alt="Nexa dashboards, analytics and finance" className="w-full h-72 md:h-96 object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos */}
      <section className="section">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center opacity-90">
          <StripeIcon />
          <TrueLayerIcon />
          <HmrcMtdIcon />
          <ShopifyIcon />
          <AmazonIcon />
          <TwilioIcon />
        </div>
      </section>

      {/* Benefits */}
      <section className="section">
        <h2 className="section-title">Key benefits</h2>
        <p className="section-subtitle">Out-of-the-box capabilities that grow with you.</p>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <Feature title="AI throughout" desc="Assistants and quick actions in every module to speed up reconciliation, planning, and analysis." icon={<AiIcon />} />
          <Feature title="Governance & security" desc="RBAC/SoD, rate limits, secret masking, security headers, and audit trails built-in." icon={<ConnectorsIcon />} />
          <Feature title="Performance & scale" desc="Fast pages with sensible defaults, pagination, and background jobs designed for scale." icon={<AnalyticsIcon />} />
        </div>
      </section>

      {/* Modules teaser */}
      <section className="section">
        <h2 className="section-title">Modules</h2>
        <p className="section-subtitle">From finance to operations — activate only what you need.</p>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <Feature title="Billing & Subscriptions" desc="Plans, subscriptions, usage, invoices and Stripe integration." icon={<FinanceIcon />} />
          <Feature title="Open Banking" desc="TrueLayer sandbox, accounts and transactions with masked logs." icon={<ConnectorsIcon />} />
          <Feature title="HMRC MTD VAT" desc="OAuth, obligations, returns and filing with audit safety." icon={<AnalyticsIcon />} />
          <Feature title="Manufacturing & MRP" desc="Work orders, BOM, routing, MRP and capacity calendars." icon={<ManufacturingIcon />} />
          <Feature title="WMS & ASN/Waves" desc="Inbound ASNs, waves, picks and 3PL connectors." icon={<WmsIcon />} />
          <Feature title="Purchase Orders" desc="Suppliers, POs and lines with reminders and receiving." icon={<ConnectorsIcon />} />
        </div>
        <div className="mt-6">
          <a href="/solutions" className="btn-secondary">See all modules</a>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <h2 className="section-title">How Nexa works</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <Feature title="Connect" desc="Add keys for Stripe, Open Banking, HMRC, Twilio — or run in demo mode." icon={<ConnectorsIcon />} />
          <Feature title="Operate" desc="Use the web app and mobile parity screens. Jobs sync and reconcile on a schedule." icon={<WmsIcon />} />
          <Feature title="Observe" desc="Health, metrics, masked logs and job status — with backups and DR drills ready." icon={<AnalyticsIcon />} />
        </div>
      </section>

      {/* Testimonials removed per spec */}
      {/* Pricing removed; show contact sales placeholder if ever routed */}

      {/* CTA */}
      <section className="section">
        <div className="card p-8 flex items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-semibold">Ready to see Nexa in action?</h3>
            <p className="text-slate-600 mt-1">We’ll tailor a quick walkthrough to your use case.</p>
          </div>
          <a href="/contact" className="btn-primary">Book a demo</a>
        </div>
      </section>
    </div>
  )
}
