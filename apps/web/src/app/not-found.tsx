import React from "react";
export const dynamic = 'force-dynamic';
export default function NotFound(){
  return (
    <div style={{ display:"grid", placeItems:"center", minHeight:"60vh", gap:12 }}>
      <h1>Page not found</h1>
      <a href="/dashboard" className="nexa-link">Go to Dashboard</a>
    </div>
  );
}
