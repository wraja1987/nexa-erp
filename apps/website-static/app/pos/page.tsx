export const metadata = { title:"Point of Sale (POS) • Nexa ERP", description:"In-person sales with Stripe Terminal, receipts, offline park→sync and postings." };
export default function POS(){
  return (<main className="container">
    <h1>Point of Sale (POS)</h1>
    <div className="grid grid-3">
      <article className="card"><h3>Stripe Terminal checkout</h3><p className="small">Pair a reader, take secure chip & tap payments and print/email branded receipts.</p></article>
      <article className="card"><h3>Offline park → sync</h3><p className="small">Keep selling when offline. Park orders; they sync automatically when back online.</p></article>
      <article className="card"><h3>Reconciliation + postings</h3><p className="small">X/Z reports, tender reconciliation and optional GL/stock postings on pay/refund.</p></article>
    </div>
  </main>);
}
