import SiteNav from './SiteNav'
import AiLoader from './AiLoader'
import Image from 'next/image'

export default function Header() {
  return (
    <header style={{ marginBottom: 16 }}>
      <div
        className="bg-fluid"
        style={{ borderRadius: "12px", padding: "12px 16px" }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            {/* Inline SVG fallback ensures logo always renders even if static asset serving varies */}
            <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <circle cx="14" cy="14" r="14" fill="#6366F1"/>
              <text x="14" y="18" textAnchor="middle" fontSize="14" fontFamily="Inter, system-ui" fontWeight="700" fill="#FFFFFF">N</text>
            </svg>
            <h1 style={{ margin: 0, fontSize: 18, whiteSpace: 'nowrap' }}>Nexa ERP</h1>
          </div>
          <div title="AI" style={{ flex: '0 0 auto' }}>
            <AiLoader />
          </div>
        </div>
      </div>
      <SiteNav />
    </header>
  );
}
