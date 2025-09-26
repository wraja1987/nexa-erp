"use client";
import React from "react";
export const dynamic = "force-dynamic";

export default function LoginPage(){
  const [csrf, setCsrf] = React.useState("");
  React.useEffect(() => {
    fetch("/api/auth/csrf", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setCsrf(d?.csrfToken || ""))
      .catch(() => setCsrf(""));
  }, []);

  return (
    <main style={{minHeight:"100dvh",display:"grid",placeItems:"center",padding:24}}>
      <form method="post" action="/api/auth/callback/credentials" style={{display:"grid",gap:12,width:360,maxWidth:"90vw"}}>
        <input type="hidden" name="csrfToken" value={csrf} />
        <label>
          <div style={{fontSize:12,opacity:.7,marginBottom:6}}>Email</div>
          <input name="email" type="email" required aria-label="Email" />
        </label>
        <label>
          <div style={{fontSize:12,opacity:.7,marginBottom:6}}>Password</div>
          <input name="password" type="password" required aria-label="Password" />
        </label>
        <button type="submit" style={{padding:"10px 14px"}}>Log in</button>
      </form>
    </main>
  );
}
