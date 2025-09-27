export const metadata = { title: "Industries • Nexa ERP", description: "Tailored for your industry." };
const sectors = [
  ["Wholesale & Distribution","Purchase→receipt, ASN, 3PL, accurate stock and simple invoicing."],
  ["Manufacturing & Supply Chain","MRP/APS, capacity, quality, maintenance and cost control."],
  ["Retail & eCommerce","Multi-channel orders, returns, fulfilment and payments (Shopify/Amazon/eBay)."],
  ["Services & SaaS","Projects, time/expense, subscriptions/usage billing and cash visibility."],
  ["Construction","CIS, purchasing, inventory and project cost tracking."],
  ["Healthcare Suppliers","Lot/serial traceability, quality holds and CAPA."],
  ["Food & Beverage","Batches, expiries, QC, recalls and audits."],
  ["Automotive Parts","VIN/serial tracking, multi-warehouse and returns."]
];
export default function Industries(){
  return (<main className="container">
    <h1>Built for every industry</h1>
    <p className="small">Nexa adapts to your processes. Here are examples; we tailor deployments to your needs.</p>
    <div className="grid grid-4" style={{marginTop:12}}>
      {sectors.map(([title,blurb])=>(
        <article key={title as string} className="card" style={{minHeight:120}}>
          <h3>{title as string}</h3><p className="small">{blurb as string}</p>
        </article>
      ))}
    </div>
  </main>);
}
