import * as React from "react";
import Head from "next/head";
import { signIn } from "next-auth/react";

export default function ForgotPassword() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      if (res && ((res as any).ok || (res as any).status === 200)) {
        setSent(true);
      } else {
        setErr("We couldn’t send the email. Please try again.");
      }
    } catch {
      setErr("Network error while sending the email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head><title>Nexa — Forgot password</title></Head>
      <div style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#0b1020"}}>
        <div style={{width:420,background:"#fff",borderRadius:12,boxShadow:"0 8px 30px rgba(0,0,0,.12)",padding:24}}>
          {sent ? (
            <div style={{textAlign:"center"}}>
              <h2 style={{margin:"8px 0 4px"}}>Check your email</h2>
              <p style={{color:"#555",margin:"0 0 16px"}}>We’ve sent a secure sign-in link to <strong>{email}</strong>.</p>
              <button onClick={()=>window.close()} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"0",background:"#4f46e5",color:"#fff",fontWeight:600,cursor:"pointer"}}>
                Close window
              </button>
            </div>
          ) : (
            <>
              <h2 style={{margin:"0 0 8px"}}>Forgot your password?</h2>
              <p style={{color:"#555",margin:"0 0 16px"}}>Enter your email and we’ll send you a secure sign-in link.</p>
              <form onSubmit={onSubmit}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{width:"100%",padding:"10px 12px",border:"1px solid #ddd",borderRadius:8,marginBottom:12}}
                />
                <button disabled={loading} type="submit"
                  style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"0",background:"#4f46e5",color:"#fff",fontWeight:600,cursor:"pointer",opacity:loading?0.7:1}}>
                  {loading ? "Sending..." : "Send sign-in link"}
                </button>
                {err && <p style={{color:"#d92d20",marginTop:10}}>{err}</p>}
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}


