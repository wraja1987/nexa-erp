import * as React from "react";
export default function Topbar(){
  return (
    <header style={{height:56,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 12px",borderBottom:"1px solid #1f2937"}}>
      <div>Nexa</div>
      <nav>
        <a href="/app" style={{marginRight:12}}>App</a>
        <a href="/settings">Settings</a>
      </nav>
    </header>
  );
}









