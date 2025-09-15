"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState,useMemo } from "react"
import { modules } from "../lib/router/modules"
export default function SidebarNav(){
  const pathname=usePathname()||"/app/dashboard"
  const active=pathname.split("/").filter(Boolean)[1]||"dashboard"
  const initial=useMemo(()=>Object.fromEntries(modules.map(m=>[m.slug,true])),[])
  const [open,setOpen]=useState<Record<string,boolean>>(initial)
  const toggle=(slug:string)=>setOpen(s=>({...s,[slug]:!s[slug]}))
  return (
    <aside className="nx-sidebar">
      <div className="nx-logo"><span style={{background:"#fff",color:"#2E6BFF",borderRadius:8,padding:"6px 8px",fontWeight:800}}>N</span> Nexa</div>
      {modules.map(m=>(
        <div key={m.slug} className="nx-sb-sec">
          <div className="nx-sb-head">
            <div className="nx-sb-title">{m.label}</div>
            {m.subs.length>0 && <div className="nx-chev" onClick={()=>toggle(m.slug)}>{open[m.slug]?"▾":"▸"}</div>}
          </div>
          <Link href={`/app/${m.slug}`} className={`nx-sb-link ${active===m.slug?"active":""}`}>{m.label}</Link>
          {m.subs.length>0 && open[m.slug] &&
            <div className="nx-subs">
              {m.subs.map(s=>(<Link key={s.slug} href={`/app/${m.slug}/${s.slug}`} className="nx-sub">{s.label}</Link>))}
            </div>}
        </div>
      ))}
    </aside>
  )
}
