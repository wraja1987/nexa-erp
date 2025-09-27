"use client";
import * as React from "react";

export default function Login() {
  const colours = { blue: "#2E6BFF", navy: "#0F2747", bg: "#F7F9FC", text: "#0B1424" } as const;
  const [error, setError] = React.useState<string | null>(null);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const body = new FormData(form);
    const res = await fetch("/api/auth/login", { method: "POST", body });
    if (res.ok) {
      window.location.href = "/dashboard";
    } else {
      const msg = await res.text();
      setError(msg || "Login failed");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: colours.bg }}>
      <div style={{ position: "absolute", top: 16, left: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <img src="/logo-nexa.png" alt="Nexa" style={{ height: 28 }} />
        <span style={{ fontWeight: 600, color: colours.navy }}>Nexa ERP</span>
      </div>

      <main style={{ display: "grid", placeItems: "center", minHeight: "100vh", padding: 16 }}>
        <div style={{ width: "100%", maxWidth: 520, background: "#fff", border: "1px solid #E5EAF1", borderRadius: 12, padding: 22, boxShadow: "0 4px 16px rgba(15,39,71,0.06)" }}>
          <h1 style={{ margin: 0, fontSize: 22, color: colours.navy }}>Sign in</h1>
          <p style={{ margin: "6px 0 16px", color: "#506481" }}>Use your credentials to continue</p>

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>

            <div>
              <label htmlFor="email" style={{ display: "block", fontSize: 13, marginBottom: 6, color: colours.text }}>Email</label>
              <input id="email" name="email" type="email" required style={{ width: "100%", height: 42, border: "1px solid #D3DBE6", borderRadius: 8, padding: "0 12px" }} />
            </div>

            <div>
              <label htmlFor="password" style={{ display: "block", fontSize: 13, marginBottom: 6, color: colours.text }}>Password</label>
              <input id="password" name="password" type="password" required style={{ width: "100%", height: 42, border: "1px solid #D3DBE6", borderRadius: 8, padding: "0 12px" }} />
            </div>

            <button type="submit" style={{ height: 42, borderRadius: 8, border: 0, background: colours.blue, color: "#fff", fontWeight: 600 }}>
              Log in
            </button>
            {error && <div role="alert" style={{ color: colours.text, opacity: .9 }}>{error}</div>}
          </form>

          <div style={{ marginTop: 10, fontSize: 12, color: "#506481" }}>
            Demo credentials: {process.env.DEMO_EMAIL || "demo@example.com"} / {process.env.DEMO_PASS || "demo-password"}
          </div>
        </div>
      </main>

      <footer style={{position:"absolute", bottom:12, left:16, right:16, display:"flex", gap:12, justifyContent:"center", fontSize:12, color:"#506481"}}>
        <a href="#" style={{textDecoration:"none", color:"inherit"}}>Privacy</a> ·
        <a href="#" style={{textDecoration:"none", color:"inherit"}}>Cookies</a> ·
        <a href="#" style={{textDecoration:"none", color:"inherit"}}>Accessibility</a> ·
        <a href="#" style={{textDecoration:"none", color:"inherit"}}>Security</a>
      </footer>
    </div>
  );
}
