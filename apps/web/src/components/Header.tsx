import Nav from './Nav'

export default function Header() {
  return (
    <header style={{ marginBottom: 16 }}>
      <div
        className="bg-fluid"
        style={{ borderRadius: "12px", padding: "16px", display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo-optra.png" alt="Optra" width={28} height={28} />
          <h1 style={{ margin: 0, fontSize: 18 }}>Optra ERP</h1>
        </div>
        <div>
          <button className="btn-primary" aria-label="Open AI Assistant">AI</button>
        </div>
      </div>
      <Nav />
    </header>
  );
}
