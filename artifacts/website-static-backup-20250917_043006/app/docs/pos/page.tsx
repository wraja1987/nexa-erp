export const metadata={title:"Point of Sale (POS) • Nexa ERP",description:"Point of Sale (POS) guide."};
export default function Doc(){return(<main className="container">
  <h1>Point of Sale (POS)</h1>
  <p>In-person sales with Stripe Terminal, receipts, offline park→sync, reconciliation and postings.</p>
  <h2>Common actions</h2>
  <ol><li>Pair a Terminal reader.</li><li>Checkout: scan items; take payment.</li><li>Offline: park; sync later.</li><li>X/Z reports for totals; reconcile takings.</li></ol>
  <h2>Tips</h2>
  <ul><li>Toggle POS postings when you want GL/stock updates on pay/refund.</li></ul>
</main>);}
