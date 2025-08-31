export default function Home() {
  return (
    <main>
      <div className="card" style={{ marginTop: 12 }}>
        <h2 style={{ marginTop: 0 }}>Welcome to Nexa ERP</h2>
        <p className="text-muted">Unified ERP platform, Phase 4 baseline.</p>
        <button className="btn-primary">Primary Action</button>
        <div style={{ marginTop: 12 }} className="ai-confirm">
          <div style={{ padding: 12 }}>
            <strong>AI Confirmation Card</strong><br />
            This is how AI confirmation cards will glow before you approve actions.
            <div style={{ marginTop: 8 }}>
              {/* Nexa AI loader demo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {/* Component import would require path setup in this file; inline for demo */}
              <img src="/logo-nexa.png" alt="Nexa" width={24} height={24} className="ai-loader-n" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
