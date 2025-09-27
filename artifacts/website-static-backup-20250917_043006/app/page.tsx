import AiEngine from "@/components/AiEngine";

export const metadata = { title: "Nexa ERP — AI-powered control for finance, operations & manufacturing", description: "Bring finance, operations and manufacturing together. Governed access, full audit, and actionable insights — so you close faster, ship on time and scale with confidence." };

export default function Home(){
  const core = [
    ["Finance","/docs/finance/"],
    ["Inventory & WMS","/docs/wms/"],
    ["Manufacturing","/docs/manufacturing/"],
    ["Projects","/docs/projects/"],
    ["Compliance & Tax","/docs/"],
    ["Banking & Billing","/docs/"],
    ["Sales & CRM","/docs/sales-crm/"]
  ];
  return (
    <>
      <header className="hero">
        {/* background image removed per request */}
        <div className="inner">
          <h1>Smarter ERP powered by AI — clarity, control, and confidence</h1>
          <p>Unify finance, operations, and manufacturing with governed access, full audit, and actionable insights — close faster, ship on time, and scale with confidence.</p>
          <a className="btn primary" href="/contact/">Request a demo</a>
        </div>
      </header>

      <main className="container">
        <section className="band">
          <h2>Core Areas</h2>
          <div className="core-grid" style={{marginTop:12}}>
            {core.map(([title,href])=>
              (<a key={title as string} className="core-tile" href={href as string}>{title as string}</a>)
            )}
          </div>
        </section>

        <section style={{marginTop:20}}>
          <h2 className="small" style={{textTransform:"uppercase",letterSpacing:".08em"}}>AI Engine Overview</h2>
          <div style={{maxWidth:860, margin:"12px auto"}}>
            <AiEngine/>
          </div>
        </section>

        {/* Trust strip */}
        <section className="section">
          <h2 style={{textAlign:"center"}}>Trusted by growing businesses across industries</h2>
          <div className="grid grid-4" style={{marginTop:12}}>
            <div className="card"><strong>Retail</strong><p className="small">Out-of-stocks cut by 18% with real‑time stock.</p></div>
            <div className="card"><strong>Manufacturing</strong><p className="small">On‑time WO completion up 22% via MRP.</p></div>
            <div className="card"><strong>Wholesale</strong><p className="small">Cycle counts in half the time with CAPA.</p></div>
            <div className="card"><strong>Services</strong><p className="small">Faster billing with Projects & Timesheets.</p></div>
          </div>
        </section>

        {/* Feature highlights */}
        <section className="section">
          <h2>Highlights</h2>
          <div className="grid grid-4" style={{marginTop:12}}>
            <div className="card"><h3>Finance</h3><p className="small">Close books faster with full audit trail.</p></div>
            <div className="card"><h3>Inventory & WMS</h3><p className="small">Track stock across warehouses in real time.</p></div>
            <div className="card"><h3>Manufacturing</h3><p className="small">Plan and optimise production.</p></div>
            <div className="card"><h3>Sales & CRM</h3><p className="small">Convert leads to orders faster.</p></div>
          </div>
        </section>

        {/* Why choose Nexa */}
        <section className="section">
          <h2>Why choose Nexa</h2>
          <div className="grid grid-3" style={{marginTop:12}}>
            <div className="card"><h3>AI built in</h3><p className="small">Predictive insights, not just reports.</p></div>
            <div className="card"><h3>Compliance first</h3><p className="small">UK GDPR, HMRC VAT MTD and CIS built‑in.</p></div>
            <div className="card"><h3>Scalable</h3><p className="small">From startups to multi‑entity enterprises.</p></div>
          </div>
        </section>

        {/* Demo screenshots placeholders */}
        <section className="section" aria-labelledby="screenshots">
          <h2 id="screenshots">Screenshots</h2>
          <div className="grid grid-3 grid-tight" style={{marginTop:12}}>
            <figure className="card screenshot"><img src="/assets/screenshot-dashboard.png" alt="Nexa Dashboard — KPIs and AI insights" className="responsive-img" style={{border:'none'}} loading="lazy" decoding="async"/><figcaption className="small" style={{marginTop:8}}>Dashboard</figcaption></figure>
            <figure className="card screenshot"><img src="/assets/screenshot-finance.png" alt="Nexa Finance — Close faster with clear ledgers" className="responsive-img" style={{border:'none'}} loading="lazy" decoding="async"/><figcaption className="small" style={{marginTop:8}}>Finance</figcaption></figure>
            <figure className="card screenshot"><img src="/assets/screenshot-pos.png" alt="Nexa POS — Quick checkout in Nexa theme" className="responsive-img" style={{border:'none'}} loading="lazy" decoding="async"/><figcaption className="small" style={{marginTop:8}}>POS</figcaption></figure>
          </div>
        </section>

        {/* Industries */}
        <section className="section">
          <h2>Industries we serve</h2>
          <p className="small">Best suited for these industries, and adaptable to many more.</p>
          <div className="grid grid-4 grid-tight" style={{marginTop:12}}>
            <div className="card sm">Wholesale & Distribution</div>
            <div className="card sm">Manufacturing & Supply Chain</div>
            <div className="card sm">Retail & eCommerce</div>
            <div className="card sm">Services & SaaS</div>
            <div className="card sm">Food & Beverage</div>
            <div className="card sm">Electronics & Assembly</div>
            <div className="card sm">Construction Suppliers</div>
          </div>
        </section>

        {/* Pricing CTA preview */}
        <section className="section">
          <div className="band" style={{textAlign:'center'}}>
            <h3>Flexible plans for every business</h3>
            <p className="small">Contact us for a quote tailored to your needs.</p>
            <a className="btn primary" href="/pricing/">See pricing</a>
          </div>
        </section>

        {/* Security & compliance */}
        <section className="section">
          <div className="band">
            <div className="grid grid-3">
              <div className="card sm"><strong>Role‑based access</strong><p className="small">Ensure people only see what they should with granular roles.</p></div>
              <div className="card sm"><strong>MFA</strong><p className="small">Protect accounts with second‑factor authentication.</p></div>
              <div className="card sm"><strong>Audit logging</strong><p className="small">Every action — including AI prompts — recorded with history.</p></div>
            </div>
            <div className="grid grid-3" style={{marginTop:12}}>
              <div className="card sm"><strong>Backups</strong><p className="small">Automated daily backups encrypted at rest.</p></div>
              <div className="card sm"><strong>Disaster recovery</strong><p className="small">Restore quickly with tested runbooks and RTO targets.</p></div>
              <div className="card sm"><strong>Compliance</strong><p className="small">UK GDPR, HMRC VAT MTD, CIS — with evidence.</p></div>
            </div>
          </div>
        </section>

        {/* AI + automation spotlight */}
        <section className="section">
          <h2>AI & Automation</h2>
          <div className="grid grid-4" style={{marginTop:12}}>
            <div className="card">OCR for invoices</div>
            <div className="card">AI Assist in every module</div>
            <div className="card">Predictive Scenarios</div>
            <div className="card">Workflow automation</div>
          </div>
          <div className="grid grid-4" style={{marginTop:12}}>
            <div className="card">Smart Invoicing</div>
            <div className="card">Purchase Forecasting</div>
            <div className="card">Anomaly detection</div>
            <div className="card">Recommendations</div>
          </div>
        </section>

        {/* Secondary CTAs */}
        <section className="section">
          <div style={{maxWidth:960,margin:'0 auto'}} className="grid grid-3 grid-tight">
            <a className="btn sm" href="/contact/">Contact sales</a>
            <a className="btn sm" href="/products/">Explore modules</a>
            <a className="btn sm" href="/docs/getting-started/">Try Nexa AI Assist</a>
          </div>
        </section>
      </main>
    </>
  );
}
