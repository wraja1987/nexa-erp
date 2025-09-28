import fs from "fs";
import path from "path";
import React from "react";
import KpiCard, { Kpi } from "@/components/KpiCard";
import QuickLinks, { QuickLink } from "@/components/QuickLinks";
import InsightsPanel from "@/components/InsightsPanel";
import AiEngineBar from "@/components/AiEngineBar";

type ModuleData = { title?: string; kpis?: Kpi[]; quickLinks?: QuickLink[]; insights?: string[]; cards?: any[]; links?: any[]; };

function readModule(id: string): ModuleData | null {
  const file = `${id}.json`; // e.g. "finance.json"
  const candidates = [
    path.join(process.cwd(), "apps", "web", "public", "modules", file),
    path.join(process.cwd(), "public", "modules", file),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try { return JSON.parse(fs.readFileSync(p, "utf-8")); } catch { return null; }
    }
  }
  return null;
}

export default async function ModulePage({ params }: { params: { id: string } }) {
  const data = readModule(params.id);
  if (!data) {
    return (
      <div style={{ display:"grid", gap:16 }}>
        <h1 style={{ margin:0 }}>{params.id}</h1>
        <div className="nexa-card" role="alert" aria-live="polite">No configuration found for this module.</div>
        <AiEngineBar context={params.id} />
      </div>
    );
  }
  const title = data.title ?? params.id;
  const kpis = Array.isArray(data.kpis) ? data.kpis
             : Array.isArray(data.cards) ? data.cards.map((c:any)=>({ label: String(c.title||""), value: c.value, hint: c.hint })) : [];
  const quickLinks = Array.isArray(data.quickLinks) ? data.quickLinks
                   : Array.isArray(data.links) ? data.links : [];
  const insights = Array.isArray(data.insights) ? data.insights : [];

  return (
    <div style={{ display:"grid", gap:16 }}>
      <h1 style={{ margin:0 }}>{title}</h1>
      {kpis.length > 0 && (
        <section role="list" aria-label="KPIs" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12 }}>
          {kpis.map((k, i) => (<div key={i} role="listitem"><KpiCard {...k} /></div>))}
        </section>
      )}
      <section className="nexa-card" aria-labelledby="module-actions-title">
        <h2 id="module-actions-title" style={{ margin:"0 0 8px" }}>Actions</h2>
        <QuickLinks links={quickLinks} />
      </section>
      {insights.length > 0 && (
        <section className="nexa-card" aria-labelledby="module-insights-title">
          <h2 id="module-insights-title" style={{ margin:"0 0 8px" }}>AI Insights</h2>
          <InsightsPanel items={insights} />
        </section>
      )}
      <section role="region" aria-label="AI Engine status">
        <AiEngineBar context={title} />
      </section>
    </div>
  );
}
