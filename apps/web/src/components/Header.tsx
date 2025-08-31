import Nav from './Nav'
import AiLoader from './AiLoader'

export default function Header() {
  return (
    <header style={{ marginBottom: 16 }}>
      <div
        className="bg-fluid"
        style={{ borderRadius: "12px", padding: "16px", display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo-nexa.png" alt="Nexa" width={28} height={28} />
          <h1 style={{ margin: 0, fontSize: 18 }}>Nexa ERP</h1>
        </div>
        <div title="AI">
          <AiLoader />
        </div>
      </div>
      <Nav />
    </header>
  );
}
