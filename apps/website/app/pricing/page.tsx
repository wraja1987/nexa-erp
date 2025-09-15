export const metadata = {
  title: "Pricing • Nexa ERP",
  description: "Three packages that map to your stage of growth. Prices available on request."
};

const plans = [
  {
    name: "Standard",
    tagline: "Core operations for growing teams",
    features: [
      "RBAC/SoD, multi-entity ready",
      "Finance: GL, AP, AR, Bank Rec, VAT (MTD), Fixed Assets, Period Close, FX Revaluation, Costing",
      "Inventory: Items & Lots, Warehouses, Stock movements",
      "Sales & Purchasing; Projects (core)",
      "Open Banking feeds; Stripe Payments",
      "Dashboards & CSV export",
      "Nexa AI Assist; OCR for invoices/receipts; Workflows & Notifications",
      "PWA & Mobile apps",
      "Connectors: Microsoft 365, Google Workspace, HMRC VAT, Stripe, Twilio"
    ],
    cta: { label: "Request a quote", href: "/contact#quote" }
  },
  {
    name: "Professional",
    tagline: "Advanced WMS & manufacturing with multi-entity",
    features: [
      "Everything in Standard",
      "Advanced WMS: ASN, Wave, 3PL; Cycle counting",
      "Quality: Holds & CAPA",
      "Manufacturing: BOM & Routings, Work Orders, MRP, Maintenance",
      "Marketplace: Shopify / Amazon / eBay",
      "Projects: time/expense and billing",
      "Billing & Metering (plans, subscriptions, usage)",
      "POS included: Stripe Terminal, receipts, offline park→sync, X/Z, reconciliation",
      "Analytics with drill-downs and saved views",
      "API Keys & Rate Limits; Backups & Disaster Recovery"
    ],
    cta: { label: "Request a quote", href: "/contact#quote" },
    featured: true
  },
  {
    name: "Enterprise",
    tagline: "Full planning, governance and analytics at scale",
    features: [
      "Everything in Professional",
      "APS (Advanced Planning & Scheduling) & Capacity Planning",
      "PLM (revisions & change control)",
      "Intercompany & Consolidation",
      "Enterprise dashboards and ad-hoc analysis",
      "Observability & SIEM export",
      "Stricter SoD policies, enforced MFA",
      "Backups & DR drills",
      "Onboarding workshops, success plan, priority support"
    ],
    cta: { label: "Request a quote", href: "/contact#quote" }
  }
];

import styles from './page.module.css'

export default function PricingPage() {
  return (
    <main className="container">
      <section className={styles.hero}>
        <h1>Plans that scale with your business</h1>
        <p>Choose a package that fits your stage. We keep it simple—<strong>no public prices</strong>. Request a quote and we’ll tailor it to your needs.</p>
      </section>

      <section className={`${styles.grid} ${styles['grid-3']}`}>
        {plans.map((p) => (
          <article
            key={p.name}
            className={`${styles.card} plan ${p.featured ? styles.featured : ''}`}
            aria-label={`${p.name} plan`}
          >
            <header className={styles['plan-head']}>
              <h2>{p.name}</h2>
              <p className={styles.tagline}>{p.tagline}</p>
            </header>
            <ul className={styles.ticks}>
              {p.features.map((f, i) => (
                <li key={i} className={styles.tickItem}>{f}</li>
              ))}
            </ul>
            <a className={styles.btn} href={p.cta.href}>{p.cta.label}</a>
          </article>
        ))}
      </section>
    </main>
  );
}
