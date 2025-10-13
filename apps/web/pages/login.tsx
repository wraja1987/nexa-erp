import * as React from "react";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";
import { authOptions } from "@/lib/auth/options";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions as any).catch(() => null);
  if (session) return { redirect: { destination: "/dashboard", permanent: false } };
  return { props: {} };
};

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await signIn("credentials", { redirect: false, email, password });
    if (res?.error) setError(res.error);
    else if (res?.ok) window.location.href = "/dashboard";
  };

  return (
    <main style={{minHeight:"100vh", display:"grid", placeItems:"center", padding:"24px"}}>
      <section style={{width:"100%", maxWidth:480, border:"1px solid #e5e7eb", borderRadius:12, padding:"24px", background:"white", boxShadow:"0 4px 16px rgba(0,0,0,0.06)"}}>
        <div style={{textAlign:"center", marginBottom:18}}>
          <img src="/logo.svg" alt="Nexa" width={48} height={48} />
          <h1 style={{margin:"12px 0 4px", fontSize:24, lineHeight:"28px"}}>Sign in to Nexa</h1>
          <p style={{color:"#6b7280", fontSize:14}}>Welcome back</p>
        </div>

        <form onSubmit={onSubmit} aria-label="Sign in form">
          <label htmlFor="email" style={{display:"block", fontWeight:600}}>Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e)=>setEmail(e.target.value)}
            style={{width:"100%", margin:"6px 0 14px", padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:8}} />

          <label htmlFor="password" style={{display:"block", fontWeight:600}}>Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e)=>setPassword(e.target.value)}
            style={{width:"100%", margin:"6px 0 14px", padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:8}} />

          {error && <div role="alert" style={{color:"#b91c1c", marginBottom:8}}>{error}</div>}

          <button type="submit" style={{width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid #16a34a", background:"#16a34a", color:"#fff", fontWeight:600}}>
            Sign in
          </button>

          <div style={{display:"flex", gap:8, marginTop:12}}>
            <button type="button" onClick={()=>signIn("google")} aria-label="Sign in with Google" style={{flex:1, padding:"10px 12px", borderRadius:8, border:"1px solid #e5e7eb"}}>Google</button>
            <button type="button" onClick={()=>signIn("azure-ad")} aria-label="Sign in with Microsoft" style={{flex:1, padding:"10px 12px", borderRadius:8, border:"1px solid #e5e7eb"}}>Microsoft</button>
          </div>

          <div style={{textAlign:"center", marginTop:12}}>
            <a href="/forgot-password" style={{color:"#2563eb"}}>Forgot password?</a>
          </div>
        </form>
      </section>
    </main>
  );
}
