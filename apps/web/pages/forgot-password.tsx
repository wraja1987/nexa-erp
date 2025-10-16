import * as React from "react";
import { signIn } from "next-auth/react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await signIn("email", { email, callbackUrl: "/dashboard", redirect: true });
      setSent(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{minHeight:"100vh", display:"grid", placeItems:"center", padding:"24px"}}>
      <section style={{width:"100%", maxWidth:480, border:"1px solid #e5e7eb", borderRadius:12, padding:"24px", background:"white", boxShadow:"0 4px 16px rgba(0,0,0,0.06)"}}>
        <h1 style={{fontSize:22, fontWeight:600, marginBottom:8}}>Reset your access</h1>
        <p style={{color:"#6b7280", fontSize:14, marginBottom:16}}>Enter your email and we’ll send you a sign-in link.</p>
        <form onSubmit={onSubmit}>
          <label htmlFor="email" style={{display:"block", fontWeight:600}}>Email</label>
          <input id="email" name="email" type="email" required value={email} onChange={(e)=>setEmail(e.target.value)}
            style={{width:"100%", margin:"6px 0 14px", padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:8}} />
          <button type="submit" disabled={busy} style={{width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid #2563eb", background:"#2563eb", color:"#fff", fontWeight:600}}>
            {busy?"Sending…":"Send link"}
          </button>
        </form>
        {sent && <p style={{marginTop:12, color:"#065f46"}}>If that email exists, a link is on its way.</p>}
        <p style={{textAlign:"center", marginTop:14}}><a href="/login" style={{color:"#2563eb"}}>Back to login</a></p>
      </section>
    </main>
  );
}
