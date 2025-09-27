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
import type { GetServerSideProps } from "next";
import fs from "fs";
import path from "path";

type ModuleData = {
  id?:string; title?:string; actions?:{label:string}[];
  kpis?:{label:string; value:string; hint?:string}[];
  insights?:string[];
};
export default function ModulePage({id, data}:{id:string; data:ModuleData|null}){
  const title = data?.title || prettify(id);
  const actions = data?.actions ?? [];
  const kpis = data?.kpis ?? [];
  const insights = data?.insights ?? [];
  return (
    <div style={{display:"grid", gap:16}}>
      <h1 style={{margin:0}}>{title}</h1>

      {kpis.length ? (
        <section style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12}}>
          {kpis.map((k,i)=>(
            <div key={i} className="nexa-card">
              <div style={{fontSize:12, color:"var(--color-muted)"}}>{k.label}</div>
              <div style={{fontSize:22, fontWeight:700, marginTop:4}}>{k.value}</div>
              {k.hint ? <div style={{fontSize:12, color:"var(--color-muted)"}}>{k.hint}</div> : null}
            </div>
          ))}
        </section>
      ) : null}

      <section className="nexa-card">
        <h2 style={{margin:"0 0 8px"}}>Actions</h2>
        {actions.length ? (
          <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
            {actions.map((a,i)=><a key={i} href="#" className="nexa-btn">{a.label}</a>)}
          </div>
        ) : <div style={{color:"var(--color-muted)"}}>No actions defined</div>}
      </section>

      {insights.length ? (
        <section className="nexa-card">
          <h2 style={{margin:"0 0 8px"}}>AI Insights</h2>
          <ul style={{margin:0, paddingLeft:20}}>
            {insights.map((t,i)=><li key={i} style={{marginBottom:6}}>{t}</li>)}
          </ul>
        </section>
      ) : null}

      <section>
        <div style={{height:10, background:"linear-gradient(90deg, var(--color-blue), var(--color-violet))", borderRadius:999}}/>
        <div style={{fontSize:12, opacity:.7, marginTop:6}}>AI Engine active</div>
      </section>
    </div>
  );
}
function prettify(s:string){ return s.replace(/[\.-]/g," ").replace(/\b\w/g,m=>m.toUpperCase()); }

export const getServerSideProps: GetServerSideProps = async (ctx)=>{
  const id = String(ctx.params?.id || "");
  const dirA = path.join(process.cwd(), "apps","web","public","modules");
  const dirB = path.join(process.cwd(), "public","modules");
  const dir = fs.existsSync(dirA) ? dirA : dirB;
  let data:ModuleData|null = null;
  try{
    const raw = fs.readFileSync(path.join(dir, `${id}.json`), "utf-8");
    data = JSON.parse(raw);
  }catch{}
  return { props: { id, data } };
};
