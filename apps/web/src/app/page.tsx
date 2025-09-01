import Image from 'next/image'

export default function Home() {
  return (
    <main role="main">
      <div className="card" style={{ marginTop: 12 }}>
        <h1 style={{ marginTop: 0 }}>Welcome to Nexa ERP</h1>
        <p className="text-muted">Unified ERP platform, Phase 4 baseline.</p>
        <button className="btn-primary">Primary Action</button>
        <div style={{ marginTop: 12 }} className="ai-confirm">
          <div style={{ padding: 12 }}>
            <strong>AI Confirmation Card</strong><br />
            This is how AI confirmation cards will glow before you approve actions.
            <div style={{ marginTop: 8 }}>
              <Image src="/logo-nexa.png" alt="Nexa" width={24} height={24} className="ai-loader-n" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
