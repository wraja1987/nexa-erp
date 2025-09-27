import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import fs from "fs";
import path from "path";

type Card = { id:string; title:string; value?:string; hint?:string };
type Link = { label:string; href:string };
type DashboardData = { cards?:Card[]; links?:Link[]; insights?:string[] };

export default function Dashboard({data}:{data:DashboardData}){
  const cards = data.cards ?? [];
  const links = data.links ?? [];
  const insights = data.insights ?? [];
  return (
    <div style={{display:"grid", gap:16}}>
      <h1 style={{margin:0}}>Dashboard</h1>

      <section style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12}}>
        {cards.map(c=>(
          <div key={c.id} className="nexa-card">
            <div style={{fontSize:12, color:"var(--color-muted)"}}>{c.title}</div>
            <div style={{fontSize:22, fontWeight:700, marginTop:4}}>{c.value ?? "—"}</div>
            {c.hint ? <div style={{fontSize:12, color:"var(--color-muted)", marginTop:2}}>{c.hint}</div> : null}
          </div>
        ))}
      </section>

      <section className="nexa-card">
        <h2 style={{margin:"0 0 8px"}}>Quick Actions</h2>
        <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
          {links.map(l=>(
            <a key={l.href} href={l.href} className="nexa-btn" style={{display:"inline-flex", alignItems:"center"}}>
              {l.label}
            </a>
          ))}
          {links.length === 0 && <div style={{color:"var(--color-muted)"}}>No quick actions configured</div>}
        </div>
      </section>

      <section className="nexa-card">
        <h2 style={{margin:"0 0 8px"}}>AI Insights</h2>
        {insights.length ? (
          <ul style={{margin:0, paddingLeft:20}}>
            {insights.map((i,idx)=><li key={idx} style={{marginBottom:6}}>{i}</li>)}
          </ul>
        ) : <div style={{color:"var(--color-muted)"}}>No insights yet</div>}
      </section>

      <section>
        <div style={{height:10, background:"linear-gradient(90deg, var(--color-blue), var(--color-violet))", borderRadius:999}}/>
        <div style={{fontSize:12, opacity:.7, marginTop:6}}>AI Engine active</div>
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<{data:DashboardData}> = async (ctx)=>{
  const session = await getServerSession(ctx.req as any, ctx.res as any, authOptions as any);
  if(!session){
    return { redirect: { destination: "/login?callbackUrl=%2Fdashboard", permanent: false } } as any;
  }
  let data:DashboardData = {};
  try{
    const pA = path.join(process.cwd(), "apps","web","public","modules","dashboard.json");
    const pB = path.join(process.cwd(), "public","modules","dashboard.json");
    const file = fs.existsSync(pA) ? pA : pB;
    data = JSON.parse(fs.readFileSync(file,"utf-8"));
  }catch{
    data = { cards:[{id:"welcome", title:"Welcome", value:"Signed in", hint:"Demo data"}] };
  }
  return { props: { data } };
};
