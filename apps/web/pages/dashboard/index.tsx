import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import fs from "fs";
import path from "path";

type Card = { id: string; title: string; value?: string; hint?: string };

type DashboardData = { cards?: Card[]; links?: { label: string; href: string }[]; insights?: string[] };

export default function Dashboard(props: { data: DashboardData }) {
  const { data } = props;
  const cards = data?.cards ?? [];
  const links = data?.links ?? [
    { label: "Finance", href: "/modules/finance" },
    { label: "Inventory & WMS", href: "/modules/inventory-wms" },
    { label: "Sales & CRM", href: "/modules/sales-crm" },
  ];
  const insights = data?.insights ?? ["AI is monitoring your KPIs", "No anomalies detected in the last 24h"];
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h1 style={{ margin: 0 }}>Dashboard</h1>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {cards.map((c) => (
          <div key={c.id} style={{ background: '#fff', border: '1px solid #E5EAF1', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{c.title}</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{c.value ?? '—'}</div>
            {c.hint ? (<div style={{ fontSize: 12, color: '#506481' }}>{c.hint}</div>) : null}
          </div>
        ))}
      </section>
      <section>
        <h2 style={{ margin: '8px 0' }}>Quick Links</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {links.map((l) => (
            <a key={l.href} href={l.href} style={{ padding: '8px 12px', background: '#2E6BFF', color: '#fff', borderRadius: 8, textDecoration: 'none' }}>{l.label}</a>
          ))}
        </div>
      </section>
      <section>
        <h2 style={{ margin: '8px 0' }}>AI Insights</h2>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {insights.map((i, idx) => (
            <li key={idx} style={{ marginBottom: 6 }}>{i}</li>
          ))}
        </ul>
      </section>
      <section>
        <div style={{ height: 10, background: 'linear-gradient(90deg, #2E6BFF, #7A4DFF)', borderRadius: 999 }} />
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>AI Engine active</div>
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<{ data: DashboardData }> = async (ctx) => {
  const session = await getServerSession(ctx.req as any, ctx.res as any, authOptions as any);
  if (!session) {
    const cb = encodeURIComponent('/dashboard');
    return { redirect: { destination: `/login?callbackUrl=${cb}`, permanent: false } } as any;
  }
  let data: DashboardData = {};
  try {
    const p = path.join(process.cwd() || '', 'apps', 'web', 'public', 'modules', 'dashboard.json');
    const alt = path.join(process.cwd() || '', 'public', 'modules', 'dashboard.json');
    const file = fs.existsSync(p) ? p : alt;
    const raw = fs.readFileSync(file, 'utf-8');
    data = JSON.parse(raw);
  } catch {
    data = { cards: [{ id: 'welcome', title: 'Welcome', value: 'Signed in', hint: 'Demo data' }] };
  }
  return { props: { data } };
};
