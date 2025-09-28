"use client";
import modules from "@/data/modules.json";
import {useMemo,useState} from "react";
export default function Product(){
  const [q,setQ]=useState(""), [cat,setCat]=useState("All");
  const cats=useMemo(()=>["All",...Object.keys(modules as any)],[]);
  const list=useMemo(()=>Object.entries(modules as any).flatMap(([category,items]:any)=> (items as any[]).filter((m:any)=>{
    const term=q.trim().toLowerCase();
    return (cat==="All"||cat===category)&&(!term||m.name.toLowerCase().includes(term)||m.desc.toLowerCase().includes(term))
  }).map((m:any)=>({category,...m}))),[q,cat]);
  return (<main className="container">
    <h1>Product</h1>
    <p className="small" style={{maxWidth:760}}>Explore Nexa modules. Search or filter by category.</p>
    <div style={{display:"flex",gap:12,margin:"12px 0"}}>
      <input placeholder="Search modules…" value={q} onChange={e=>setQ((e.target as any).value)} style={{flex:"1 1 320px",padding:10,border:"1px solid #D0D7E2",borderRadius:8}}/>
      <select value={cat} onChange={e=>setCat((e.target as any).value)} style={{padding:10,border:"1px solid #D0D7E2",borderRadius:8}}>
        {cats.map(c=><option key={c as string}>{c as string}</option>)}
      </select>
    </div>
    <div className="grid grid-3">
      {list.map((m:any)=>(
        <article className="card" key={(m.category as string)+"-"+(m.name as string)} style={{position:"relative"}}>
          <small className="small">{m.category as string}</small>
          <h3 style={{marginTop:6}}>{m.name as string}</h3>
          <p className="small">{m.desc as string}</p>
        </article>
      ))}
    </div>
  </main>);
}
