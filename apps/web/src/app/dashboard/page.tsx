import React from 'react';
import KpiCard, { Kpi } from '@/components/KpiCard';
import QuickLinks, { QuickLink } from '@/components/QuickLinks';
import InsightsPanel from '@/components/InsightsPanel';
import AiEngineBar from '@/components/AiEngineBar';
import dashboardJson from '../../../public/modules/dashboard.json';

type DashboardShape = {
  kpis?: Kpi[];
  quickLinks?: QuickLink[];
  insights?: string[];
  cards?: { id:string; title:string; value?:string; hint?:string }[];
  links?: QuickLink[];
};

function normalize(d: DashboardShape){
  const kpis: Kpi[] = d.kpis ?? (d.cards?.map(c => ({ label: c.title, value: c.value, hint: c.hint })) ?? []);
  const quickLinks: QuickLink[] = d.quickLinks ?? (d.links ?? []);
  const insights: string[] = d.insights ?? [];
  return { kpis, quickLinks, insights };
}

export default function DashboardPage(){
  const { kpis, quickLinks, insights } = normalize(dashboardJson as unknown as DashboardShape);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h1 style={{ margin: 0 }}>Dashboard</h1>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
        {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
      </section>

      <section className="nexa-card">
        <h2 style={{ margin: '0 0 8px' }}>Quick Actions</h2>
        <QuickLinks links={quickLinks} />
      </section>

      <section className="nexa-card">
        <h2 style={{ margin: '0 0 8px' }}>AI Insights</h2>
        <InsightsPanel items={insights} />
      </section>

      <section>
        <AiEngineBar context="dashboard" />
      </section>
    </div>
  );
}
