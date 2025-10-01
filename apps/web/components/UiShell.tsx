import * as React from "react";
export default function UiShell({ children }: { children: React.ReactNode }){
  return (
    <div style={{display:"grid",gridTemplateColumns:"220px 1fr",minHeight:"100dvh"}}>
      <aside style={{borderRight:"1px solid #1f2937",padding:12}}>POS</aside>
      <main style={{padding:16}}>{children}</main>
    </div>
  );
}









