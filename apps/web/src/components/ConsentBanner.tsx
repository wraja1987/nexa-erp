"use client";
import { useEffect, useState } from "react";

function getConsent(): "granted"|"denied"|"" {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(/(?:^|;\s*)nexa_consent=([^;]+)/);
  return (m?.[1] as any) || "";
}
function setConsent(v: "granted"|"denied") {
  const days = 180;
  const d = new Date(Date.now() + days*24*60*60*1000).toUTCString();
  document.cookie = `nexa_consent=${v}; Path=/; Expires=${d}; SameSite=Lax`;
}

export default function ConsentBanner() {
  const [state, setState] = useState<"unknown"|"granted"|"denied">("unknown");
  useEffect(() => {
    const c = getConsent();
    if (c === "granted" || c === "denied") setState(c as any);
  }, []);
  if (state !== "unknown") return null;

  return (
    <div style={{
      position:"fixed", bottom:0, left:0, right:0, zIndex:1000,
      background:"#0F2747", color:"#fff", padding:"12px 16px",
      display:"flex", alignItems:"center", justifyContent:"space-between"
    }}>
      <span style={{maxWidth: "70%"}}>
        We use privacy-friendly analytics (Plausible). Only load after you consent.
      </span>
      <span style={{display:"flex", gap:"8px"}}>
        <button onClick={()=>{ setConsent("denied"); setState("denied"); }} style={{padding:"8px 12px"}}>
          Decline
        </button>
        <button onClick={()=>{ setConsent("granted"); setState("granted"); location.reload(); }} style={{padding:"8px 12px", border:"1px solid #fff"}}>
          Allow
        </button>
      </span>
    </div>
  );
}
