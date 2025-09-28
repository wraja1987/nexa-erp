export const metadata = { title: "Pricing • Nexa ERP", description: "Plans that scale with your business." };
const plans = [
  {
    name:"Starter",
    pitch:"For small teams and early adopters",
    icon:"/images/hero-ai.svg",
    price:"£99 / month",
    bullets:[
      "Core Dashboard + AI Assist (basic prompts only)",
      "Finance: General Ledger; Accounts Payable; Accounts Receivable; Bank & Cash",
      "Inventory: Items & Stock Movements (single warehouse)",
      "Sales: Basic quotations & sales orders",
      "Purchasing: Simple purchase orders",
      "Projects: Task tracking (basic)",
      "Connectors: Microsoft 365 (SSO/basic), Google Workspace (SSO/basic)",
      "Mobile & PWA access (installable)",
      "Basic reporting & CSV exports",
      "GDPR Tools & Audit (essential)",
      "Not included: VAT MTD, POS, Manufacturing, Advanced WMS, Predictive analytics, Automated Backups & DR"
    ]
  },
  {
    name:"Standard",
    pitch:"Core operations for growing teams",
    icon:"/images/plan-standard.svg",
    price:"£249 / month",
    bullets:[
      "RBAC/SoD, multi-entity",
      "Finance: General Ledger, Accounts Payable, Accounts Receivable, Bank & Cash, Bank Reconciliation, VAT (MTD — live with HMRC keys), Fixed Assets, Period Close, FX Revaluation",
      "Inventory & WMS: Items & Lots, Warehouses, Stock Movements",
      "Sales & Purchasing: Quotations, Sales Orders, Purchase Orders",
      "Projects: core tasks & costing",
      "Banking: Stripe Payments/Billing live; Open Banking (TrueLayer keys)",
      "Dashboards & CSV export",
      "Mobile PWA (installable, offline sync)",
      "Connectors: Microsoft 365 (SSO/basic), Google Workspace (SSO/basic), Stripe, HMRC VAT",
      "\uD83D\uDCA1 Best for SMEs needing finance + stock control + sales/purchasing basics."
    ]
  },
  {
    name:"Professional",
    pitch:"Advanced WMS & manufacturing with automation",
    icon:"/images/plan-pro.svg",
    price:"£799 / month",
    bullets:[
      "Everything in Standard",
      "Advanced WMS: ASN, Wave, 3PL, Cycle Counting, Quality (Holds & CAPA)",
      "Manufacturing: BOM & Routings, Work Orders, MRP, Capacity Planning, Maintenance, PLM",
      "Projects: costing & billing",
      "Analytics with drill-downs",
      "Backups & DR",
      "POS: Stripe Terminal checkout, receipts (HTML/PDF), offline park→sync, reconciliation, GL postings, X/Z reports",
      "AI Assist basics (AI Insights panel, Quick Links)",
      "\uD83D\uDCA1 Best for growing distributors & manufacturers needing production + POS."
    ]
  },
  {
    name:"Enterprise",
    pitch:"Full planning, governance and analytics at scale",
    icon:"/images/plan-enterprise.svg",
    price:"£1,999 / month",
    bullets:[
      "Everything in Professional",
      "APS (Advanced Planning & Scheduling)",
      "Intercompany & Consolidation",
      "Multi-Currency & Multi-Entity",
      "Enterprise dashboards & ad-hoc analysis",
      "Observability & SIEM export",
      "Strict SoD + MFA enforced",
      "AI & Automation: OCR & Document AI, Predictive Scenarios, Workflows",
      "Admin dashboard with quotas & usage monitoring",
      "Priority support & onboarding workshops",
      "\uD83D\uDCA1 Best for multi-entity enterprises needing deep compliance, analytics, and AI."
    ]
  }
];
export default function Pricing(){
  return (<>
    <div className="pricing-hero">
      <div className="container" style={{paddingTop:6,paddingBottom:6}}>
        <h1>Plans that scale with your business</h1>
        <p className="small" style={{maxWidth:860}}>Choose a Nexa ERP package that fits your stage. Prices start from £99/month — request a tailored quote to match your team size, modules, and usage needs.</p>
      </div>
    </div>
    <main className="container pricing" style={{marginTop:0}}>
      <div className="grid grid-4" style={{alignItems:'stretch'}}>
        {plans.map(p=>(
          <article key={p.name} className="plan card nexa-illuminate plan-card">
            <div className="head">
              <div>
                <h2 style={{margin:"0 0 2px 0"}}>{p.name}</h2>
                <div className="small">{p.pitch}</div>
                {p.price && (<div className="price">{p.price}</div>)}
              </div>
            </div>
            <ul className="small" style={{listStyle:'none',padding:0,margin:'8px 0'}}>
              <li><strong>👥 Users:</strong> {p.name==="Starter"?"2 included":p.name==="Standard"?"5 included":p.name==="Professional"?"20 included":"Unlimited"}</li>
              <li><strong>🔑 AI Tokens:</strong> {p.name==="Starter"?"25k":p.name==="Standard"?"100k":p.name==="Professional"?"500k":"2M"} per month</li>
              <li><strong>🔗 API Calls:</strong> {p.name==="Starter"?"2,000":p.name==="Standard"?"10k":p.name==="Professional"?"50k":"250k"} per month</li>
            </ul>
            <details>
              <summary className="btn sm" style={{width:'fit-content'}}>Read more</summary>
              <div className="more" style={{border:'1px solid var(--line)',borderRadius:8,padding:10,background:'#fff'}}>
                <ul style={{marginTop:0}}>
                  {p.bullets.map((b,i)=>(<li key={i}>{b}</li>))}
                </ul>
              </div>
            </details>
            {/* CTA removed per request */}
          </article>
        ))}
      </div>
      {/* Add‑Ons */}
      <section style={{marginTop:16}}>
        <h2>Add‑On Packs (Optional)</h2>
        <div className="grid grid-2 grid-tight" style={{marginTop:8}}>
          <div className="card sm">
            <h3>AI Tokens</h3>
            <ul>
              <li>+100k tokens → £10</li>
              <li>+500k tokens → £40</li>
              <li>+1M tokens → £70</li>
            </ul>
          </div>
          <div className="card sm">
            <h3>API Calls</h3>
            <ul>
              <li>+10k calls → £15</li>
              <li>+50k calls → £60</li>
              <li>+100k calls → £100</li>
            </ul>
          </div>
        </div>
        <p className="small" style={{marginTop:8}}>Add‑ons do not expire until used (carry over month to month). Purchases are made via Stripe Billing and appear in the Admin usage panel.</p>
      </section>
    </main>
  </>);
}
