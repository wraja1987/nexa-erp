"use client"
import { useRouter } from "next/navigation"
export default function Topbar(){
  const r=useRouter()
  return (
    <div className="nx-topbar">
      <input className="nx-search" placeholder="Search…" />
      <div style={{display:"flex",gap:8}}>
        <button className="nx-icon" aria-label="Notifications" onClick={()=>r.push("/app/notifications")}>🔔</button>
        <button className="nx-icon" aria-label="Help" onClick={()=>r.push("/app/help/center")}>❓</button>
        <button className="nx-icon" aria-label="Account" onClick={()=>r.push("/app/account")}>👤</button>
      </div>
    </div>
  )
}
