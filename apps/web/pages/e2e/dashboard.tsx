import * as React from 'react';

type Kpi = { totalRevenue:number; arBalance:number; apBalance:number; ordersToday:number };
type Node = { name: string };

export default function E2EDashboard() {
  // Pick up preloaded state if the tests injected it
  const preload: null | { kpi?: Kpi; top?: string[] } =
    typeof window !== 'undefined' ? (window as any).__E2E_PRELOAD__ ?? null : null;

  const [kpi, setKpi] = React.useState<Kpi | null>(preload?.kpi ?? null);
  const [top, setTop] = React.useState<string[]>(preload?.top ?? []);

  React.useEffect(() => {
    // If not preloaded, fall back to live fetches (for manual dev checks)
    if (!preload?.kpi) {
      fetch('/api/kpi/dashboard', { cache: 'no-store' })
        .then(r => r.json()).then(setKpi).catch(() => {});
    }
    if (!preload?.top?.length) {
      fetch('/api/modules?tree=1', { cache: 'no-store' })
        .then(r => r.json())
        .then((arr: Node[]) => {
          const t = Array.from(new Set((arr||[]).map(n => String((n as any)?.name||'').split('.')[0]).filter(Boolean)));
          setTop(t);
        }).catch(() => {});
    }
  }, []);

  return (
    <main style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:24, padding:24 }}>
      <aside data-testid="sidebar" role="complementary" aria-label="Sidebar" style={{ borderRight:'1px solid #e5e7eb', paddingRight:16 }}>
        <nav role="navigation" aria-label="Sidebar">
          <ul>
            {top.length === 0 ? <li data-top-level="true">Loading…</li> :
              top.map((t,i)=> <li key={i} data-testid="nav-item" data-level="top" data-top-level="true" style={{ padding:'6px 0' }}>{t}</li>)
            }
          </ul>
        </nav>
      </aside>
      <section>
        <h1>Nexa — E2E Dashboard</h1>
        <div data-kpi-container style={{ display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:16, marginTop:16 }}>
          <article data-testid="kpi-totalRevenue" style={{ padding:12, border:'1px solid #e5e7eb', borderRadius:8 }}>
            <div>Total Revenue</div><strong>{kpi ? (kpi.totalRevenue as any).toLocaleString?.('en-GB') ?? String(kpi.totalRevenue) : '—'}</strong>
          </article>
          <article data-testid="kpi-arBalance" style={{ padding:12, border:'1px solid #e5e7eb', borderRadius:8 }}>
            <div>Accounts Receivable</div><strong>{kpi ? (kpi.arBalance as any).toLocaleString?.('en-GB') ?? String(kpi.arBalance) : '—'}</strong>
          </article>
          <article data-testid="kpi-apBalance" style={{ padding:12, border:'1px solid #e5e7eb', borderRadius:8 }}>
            <div>Accounts Payable</div><strong>{kpi ? (kpi.apBalance as any).toLocaleString?.('en-GB') ?? String(kpi.apBalance) : '—'}</strong>
          </article>
          <article data-testid="kpi-ordersToday" style={{ padding:12, border:'1px solid #e5e7eb', borderRadius:8 }}>
            <div>Orders Today</div><strong>{kpi ? kpi.ordersToday : '—'}</strong>
          </article>
        </div>
      </section>
    </main>
  );
}
