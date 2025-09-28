"use client";
import * as React from "react";
import Sidebar from "@/components/Sidebar";

export default function NexaLayout({ children }: { children: React.ReactNode }){
  return (
    <div style={{ display: 'flex', minHeight:'100vh', background:'var(--color-bg)', color:'var(--color-text)' }}>
      <a href="#main-content" style={{position:'absolute', left:-9999, top:'auto'}} className="skip-link">Skip to main content</a>
      <aside aria-label="Sidebar" style={{ width:260, background:"linear-gradient(180deg,#2E6BFF 0%,#7A4DFF 100%)", color:'#fff', display:'flex', flexDirection:'column' }}>
        <div style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,.15)', display:'flex', alignItems:'center', gap:8 }}>
          <img src="/logo-nexa.png" alt="Nexa" style={{ height: 28 }} />
          <span style={{ fontWeight: 700, letterSpacing: .3 }}>Nexa ERP</span>
        </div>
        <Sidebar />
      </aside>
      <main id="main-content" role="main" aria-label="Main content" style={{ flex:1, padding:16 }}>
        {children}
      </main>
    </div>
  );
}
