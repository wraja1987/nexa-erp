import type { GetServerSideProps } from "next";
import { getCsrfToken, signIn } from "next-auth/react";

type Props = { csrfToken: string | null; callbackUrl: string };

export default function Login({ csrfToken, callbackUrl }: Props) {
  const cb = callbackUrl || "/dashboard";
  const colours = { blue: "#2E6BFF", navy: "#0F2747", bg: "#F7F9FC", text: "#0B1424" } as const;

  // We do NOT preventDefault. Native POST remains as a fallback.
  const onClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      // Fire-and-forget: if JS works, NextAuth redirects; if not, the form will POST natively.
      signIn("credentials", {
        callbackUrl: cb,
        // these are read from the form too; duplicating is harmless
        email: (document.getElementById("email") as HTMLInputElement)?.value,
        password: (document.getElementById("password") as HTMLInputElement)?.value,
        redirect: true,
      });
    } catch {}
  };

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

          {/* Native POST fallback + progressive enhancement */}
          <form method="post" action="/api/auth/callback/credentials" style={{ display: "grid", gap: 12 }}>
            <input type="hidden" name="csrfToken" value={csrfToken ?? ""} />
            <input type="hidden" name="callbackUrl" value={cb} />

            <div>
              <label htmlFor="email" style={{ display: "block", fontSize: 13, marginBottom: 6, color: colours.text }}>Email</label>
              <input id="email" name="email" type="email" required style={{ width: "100%", height: 42, border: "1px solid #D3DBE6", borderRadius: 8, padding: "0 12px" }} />
            </div>

            <div>
              <label htmlFor="password" style={{ display: "block", fontSize: 13, marginBottom: 6, color: colours.text }}>Password</label>
              <input id="password" name="password" type="password" required style={{ width: "100%", height: 42, border: "1px solid #D3DBE6", borderRadius: 8, padding: "0 12px" }} />
            </div>

            <button type="submit" onClick={onClick} style={{ height: 42, borderRadius: 8, border: 0, background: colours.blue, color: "#fff", fontWeight: 600 }}>
              Log in
            </button>
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

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const token = await getCsrfToken(ctx);
  const url = new URL("http://localhost:3000" + (ctx.resolvedUrl || "/login"));
  const cb = (url.searchParams.get("callbackUrl") || "/dashboard") as string;
  return { props: { csrfToken: token ?? null, callbackUrl: cb } };
};
