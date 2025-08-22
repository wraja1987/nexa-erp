export default function Home() {
  return (
    <main>
      <div className="card" style={{ marginTop: 12 }}>
        <h2 style={{ marginTop: 0 }}>Welcome to Optra ERP</h2>
        <p className="text-muted">Unified ERP platform, Phase 4 baseline.</p>
        <button className="btn-primary">Primary Action</button>
        <div style={{ marginTop: 12 }} className="ai-confirm">
          <div style={{ padding: 12 }}>
            <strong>AI Confirmation Card</strong><br />
            This is how AI confirmation cards will glow before you approve actions.
          </div>
        </div>
      </div>
    </main>
  );
}
