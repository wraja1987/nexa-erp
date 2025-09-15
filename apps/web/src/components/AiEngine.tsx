"use client"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
export default function AiEngine(){
  const [q,setQ]=useState(""), [note,setNote]=useState<string|null>(null), [redir,setRedir]=useState<string|null>(null)
  const path=usePathname()||"/app/dashboard"; const mod=path.split("/").filter(Boolean)[1]||"dashboard"; const r=useRouter()
  const scope:Record<string,string[]>=
    {finance:["ledger","invoice","ap","ar","vat","bank","close","revaluation","fixed assets"],"inventory-and-wms":["inventory","stock","warehouse","lot","serial","wms","pick","pack"],"hr-and-payroll":["employee","payroll","payslip","leave"],"sales-and-crm":["lead","quote","order","rma","crm","customer"],purchasing:["po","requisition","supplier","receive"],manufacturing:["bom","mrp","work order","routing","capacity","aps","maintenance","plm"],projects:["project","task","timesheet","costing","billing"],pos:["pos","terminal","stripe","receipt","checkout","till"],settings:["user","role","api","backup","appearance","tenant"]}
  function classify(t:string){t=t.toLowerCase();for(const [m,keys] of Object.entries(scope)){if(keys.some(k=>t.includes(k)))return m}return null}
  function send(){const g=classify(q); if(g&&g!==mod){setNote("Let’s get you redirected to the correct section to answer that."); setRedir(g); return} setRedir(null); setNote(`(AI answering within ${mod})`)}
  return(<div className="nx-ai-wrap"><div className="nx-card pad"><strong>AI Engine</strong><div className="nx-ai" style={{marginTop:10}}><input className="nx-ai-input" placeholder="Send a message…" value={q} onChange={e=>setQ(e.target.value)}/><button className="nx-ai-send" onClick={send}>➤</button></div>{note&&<div style={{fontSize:12,color:"#6B7280",marginTop:6}}>{note}</div>}{redir&&<div style={{marginTop:8}}><button className="nx-btn" onClick={()=>r.push(`/app/${redir}`)}>Go to {redir.replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</button></div>}</div></div>)
}
