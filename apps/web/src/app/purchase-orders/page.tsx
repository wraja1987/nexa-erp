export default function PurchaseOrders() {
  return (
    <main>
      <div className="card" style={{ marginTop: 12 }}>
        <h2 style={{ marginTop: 0 }}>Purchase Orders</h2>
        <p className="text-muted">This page uses the global theme.</p>
        <button className="btn-primary">Create PO</button>
        <div style={{ marginTop: 12 }} className="ai-confirm">
          <div style={{ padding: 12 }}>
            <strong>AI Confirmation Card</strong><br />
            Example glow on a functional page.
          </div>
        </div>
      </div>
    </main>
  );
}
