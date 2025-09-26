import * as React from "react";
export default function SidebarNav(){
  return (
    <aside style={{width:220,padding:12,borderRight:"1px solid #1f2937"}}>
      <nav>
        <a href="/" style={{display:"block",padding:"6px 8px"}}>Home</a>
        <a href="/login" style={{display:"block",padding:"6px 8px"}}>Login</a>
        <a href="/billing" style={{display:"block",padding:"6px 8px"}}>Billing</a>
      </nav>
    </aside>
  );
}



