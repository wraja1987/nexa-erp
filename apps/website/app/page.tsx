function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="card p-5 h-full">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="section">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Nexa — the AI-powered ERP that’s fast, clear, and secure.
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Run finance, operations, and analytics in one place — with AI woven into every module.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="/contact" className="btn-primary">Book a demo</a>
              <a href="/solutions" className="btn-secondary">Explore modules</a>
            </div>
          </div>
          <div className="card p-0 overflow-hidden">
            <img src="/hero-nexa.jpg" alt="Nexa ERP overview" className="w-full h-64 object-cover" />
            <div className="p-6">
              <h3 className="font-semibold mb-3">Why teams choose Nexa</h3>
              <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
                <li>Unified platform: Billing, Open Banking, HMRC VAT, Manufacturing, WMS, PO, Payroll, Marketplace.</li>
                <li>Security by default: RBAC/SoD, headers, rate limits, masked logs.</li>
                <li>Operable from day one: Observability, backups, DR drills, and jobs runner.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Logos */}
      <section className="section">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 items-center opacity-80">
          <img src="/logos/stripe.svg" alt="Stripe" className="h-8 mx-auto" />
          <img src="/logos/truelayer.svg" alt="TrueLayer" className="h-8 mx-auto" />
          <img src="/logos/hmrc.svg" alt="HMRC" className="h-8 mx-auto" />
          <img src="/logos/shopify.svg" alt="Shopify" className="h-8 mx-auto" />
          <img src="/logos/amazon.svg" alt="Amazon" className="h-8 mx-auto" />
          <img src="/logos/twilio.svg" alt="Twilio" className="h-8 mx-auto" />
        </div>
      </section>

      {/* Benefits */}
      <section className="section">
        <h2 className="section-title">Key benefits</h2>
        <p className="section-subtitle">Out-of-the-box capabilities that grow with you.</p>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <Feature title="AI throughout" desc="Assistants and quick actions in every module to speed up reconciliation, planning, and analysis." />
          <Feature title="Governance & security" desc="RBAC/SoD, rate limits, secret masking, security headers, and audit trails built-in." />
          <Feature title="Performance & scale" desc="Fast pages with sensible defaults, pagination, and background jobs designed for scale." />
        </div>
      </section>

      {/* Modules teaser */}
      <section className="section">
        <h2 className="section-title">Modules</h2>
        <p className="section-subtitle">From finance to operations — activate only what you need.</p>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <Feature title="Billing & Subscriptions" desc="Plans, subscriptions, usage, invoices and Stripe integration." />
          <Feature title="Open Banking" desc="TrueLayer sandbox, accounts and transactions with masked logs." />
          <Feature title="HMRC MTD VAT" desc="OAuth, obligations, returns and filing with audit safety." />
          <Feature title="Manufacturing & MRP" desc="Work orders, BOM, routing, MRP and capacity calendars." />
          <Feature title="WMS & ASN/Waves" desc="Inbound ASNs, waves, picks and 3PL connectors." />
          <Feature title="Purchase Orders" desc="Suppliers, POs and lines with reminders and receiving." />
        </div>
        <div className="mt-6">
          <a href="/solutions" className="btn-secondary">See all modules</a>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <h2 className="section-title">How Nexa works</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <Feature title="Connect" desc="Add keys for Stripe, Open Banking, HMRC, Twilio — or run in demo mode." />
          <Feature title="Operate" desc="Use the web app and mobile parity screens. Jobs sync and reconcile on a schedule." />
          <Feature title="Observe" desc="Health, metrics, masked logs and job status — with backups and DR drills ready." />
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <h2 className="section-title">What customers say</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <div className="card p-5"><p className="text-slate-700">“Nexa brought billing and ops into one place. The AI helper saves our team hours every week.”</p><p className="mt-3 text-sm text-slate-500">Ops Director, Retail</p></div>
          <div className="card p-5"><p className="text-slate-700">“MRP and WMS in the same tool — we can plan, execute and reconcile much faster.”</p><p className="mt-3 text-sm text-slate-500">COO, Manufacturing</p></div>
          <div className="card p-5"><p className="text-slate-700">“Governance is built‑in: RBAC, SoD and audit trails are exactly what we need.”</p><p className="mt-3 text-sm text-slate-500">Finance Lead, SaaS</p></div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section">
        <h2 className="section-title">Simple pricing</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <div className="card p-6"><h3 className="font-semibold text-lg">Starter</h3><p className="text-3xl font-bold mt-2">£0</p><p className="text-slate-600 mt-1">Sandbox, demo data, API keys</p></div>
          <div className="card p-6 border-blue-600"><h3 className="font-semibold text-lg">Growth</h3><p className="text-3xl font-bold mt-2">£199</p><p className="text-slate-600 mt-1">Core modules + jobs + export</p></div>
          <div className="card p-6"><h3 className="font-semibold text-lg">Enterprise</h3><p className="text-3xl font-bold mt-2">Talk to us</p><p className="text-slate-600 mt-1">Full stack, SSO, support</p></div>
        </div>
      </section>

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
