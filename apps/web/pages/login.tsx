import * as React from "react";
import Head from "next/head";
import { getCsrfToken } from "next-auth/react";

type LoginProps = { csrfToken?: string };

export default function Login({ csrfToken }: LoginProps) {
  return (
    <>
      <Head>
        <title>Sign in – Nexa</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <a href="#main" className="sr-only focus:not-sr-only">Skip to main content</a>
      <main id="main" role="main" className="container-narrow" style={{ display: "grid" }}>
        <div style={{ width: "100%", background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Sign in</h1>
          <p id="signin-help" style={{ color: "#4b5563", marginBottom: 16 }}>Use your organisation account to continue.</p>
          <div style={{ display: "grid", gap: 10 }}>
            <form method="post" action="/api/auth/signin/google" aria-describedby="signin-help" style={{ margin: 0 }}>
              <input type="hidden" name="csrfToken" value={csrfToken ?? ""} />
              <button type="submit" style={{ width: "100%", textAlign: "center", padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 8, background: "white", color: "#111" }}>Continue with Google</button>
            </form>
            <form method="post" action="/api/auth/signin/azure-ad" aria-describedby="signin-help" style={{ margin: 0 }}>
              <input type="hidden" name="csrfToken" value={csrfToken ?? ""} />
              <button type="submit" style={{ width: "100%", textAlign: "center", padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 8, background: "white", color: "#111" }}>Continue with Microsoft</button>
            </form>
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: "#6b7280" }}>Credentials login is disabled.</div>
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps(context: any) {
  const csrfToken = await getCsrfToken(context);
  return { props: { csrfToken } };
}
