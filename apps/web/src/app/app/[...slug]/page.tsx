import fs from 'fs';
import path from 'path';
import React from 'react';
import KpiCard, { Kpi } from '@/components/KpiCard';
import QuickLinks, { QuickLink } from '@/components/QuickLinks';
import InsightsPanel from '@/components/InsightsPanel';
import AiEngineBar from '@/components/AiEngineBar';

function safeReadJson(filePath: string): any | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function joinSlugToFilename(slug: string[]): string {
  return `${slug.join('-')}.json`;
}

function normalize(d: any): { title: string; kpis: Kpi[]; quickLinks: QuickLink[]; insights: string[] } {
  const title: string = (d?.title as string) || 'Module';
  const kpis: Kpi[] = Array.isArray(d?.kpis)
    ? d.kpis
    : Array.isArray(d?.cards)
      ? d.cards.map((c: any) => ({ label: String(c.title||''), value: c.value, hint: c.hint }))
      : [];
  const quickLinks: QuickLink[] = Array.isArray(d?.quickLinks) ? d.quickLinks : (Array.isArray(d?.links) ? d.links : []);
  const insights: string[] = Array.isArray(d?.insights) ? d.insights : [];
  return { title, kpis, quickLinks, insights };
}

export default async function ModulePage({ params }: { params: { slug: string[] } }){
  const slug = params.slug || [];
  const filename = joinSlugToFilename(slug);
  const dirA = path.join(process.cwd(), 'apps','web','public','modules');
  const dirB = path.join(process.cwd(), 'public','modules');
  const dir = fs.existsSync(dirA) ? dirA : dirB;
  const filePath = path.join(dir, filename);
  const raw = safeReadJson(filePath);

  if (!raw) {
    const pretty = slug.join(' / ') || 'Module';
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <h1 style={{ margin: 0 }}>{pretty}</h1>
        <div className="nexa-card" role="alert" aria-live="polite">No configuration found for this module.</div>
        <section>
          <AiEngineBar context={pretty} />
        </section>
      </div>
    );
  }

  const { title, kpis, quickLinks, insights } = normalize(raw);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h1 style={{ margin: 0 }}>{title}</h1>

      {kpis.length > 0 && (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }} role="list" aria-label="KPIs">
          {kpis.map((k, i) => (
            <div key={i} role="listitem"><KpiCard {...k} /></div>
          ))}
        </section>
      )}

      <section className="nexa-card" aria-labelledby="module-actions-title">
        <h2 id="module-actions-title" style={{ margin: '0 0 8px' }}>Actions</h2>
        <QuickLinks links={quickLinks} />
      </section>

      {insights.length > 0 && (
        <section className="nexa-card" aria-labelledby="module-insights-title">
          <h2 id="module-insights-title" style={{ margin: '0 0 8px' }}>AI Insights</h2>
          <InsightsPanel items={insights} />
        </section>
      )}

      <section role="region" aria-label="AI Engine status">
        <AiEngineBar context={title} />
      </section>
    </div>
  );
}
