import * as React from "react";
import Head from "next/head";
import { requireAuth } from "@/src/lib/auth/ssr";

export const getServerSideProps = requireAuth(async () => ({ props: {} }));

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Dashboard – Nexa</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main style={{ padding: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Dashboard</h1>
        <p>Welcome to Nexa — this page is protected (SSR guard).</p>
        <ul>
          <li>Try the secure API: <code>/api/secure/ping</code></li>
        </ul>
      </main>
    </>
  );
}
