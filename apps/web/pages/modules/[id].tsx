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
