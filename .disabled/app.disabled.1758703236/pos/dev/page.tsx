"use client";
import { useState } from "react";

export default function POSDev(){
  const [amount,setAmount]=useState(1000); // £10.00
  const [pi,setPI]=useState<any>(null);
  const [msg,setMsg]=useState("");

  async function createPI(){
    setMsg("Creating PaymentIntent…");
    const r=await fetch("/api/pos/payment_intent",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({amount,currency:"gbp"})});
    const j=await r.json(); if(r.ok){ setPI(j); setMsg("PI created. Use a simulated reader to collect payment, then Capture."); } else { setMsg("Error: "+j.error); }
  }
  async function capturePI(){
    if(!pi?.id){ setMsg("No PI"); return; }
    setMsg("Capturing…");
    const r=await fetch("/api/pos/payment_capture",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({payment_intent_id:pi.id})});
    const j=await r.json(); setMsg(r.ok ? "Captured ✅" : "Capture error: "+j.error);
  }
  async function refundPI(){
    if(!pi?.id){ setMsg("No PI"); return; }
    setMsg("Refunding…");
    const r=await fetch("/api/pos/refund",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({payment_intent_id:pi.id, amount: amount})});
    const j=await r.json(); setMsg(r.ok ? "Refund created ✅" : "Refund error: "+j.error);
  }

  return (<main className="container">
    <h1>POS Dev (Stripe Terminal — simulated)</h1>
    <p className="small">Use Stripe test keys + a simulated reader. Flow: Create Intent → collect on reader → Capture → Refund.</p>
    <div className="band" style={{display:"grid",gap:12,maxWidth:520}}>
      <label>Amount (pence)<input type="number" value={amount} onChange={e=>setAmount(parseInt(e.target.value||"0"))} /></label>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <button className="btn" onClick={createPI}>Create Intent</button>
        <button className="btn" onClick={capturePI} disabled={!pi}>Capture</button>
        <button className="btn" onClick={refundPI} disabled={!pi}>Refund</button>
      </div>
      <pre className="small" style={{whiteSpace:"pre-wrap"}}>{msg}</pre>
      {pi && <pre className="small" style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(pi,null,2)}</pre>}
    </div>
  </main>);
}
