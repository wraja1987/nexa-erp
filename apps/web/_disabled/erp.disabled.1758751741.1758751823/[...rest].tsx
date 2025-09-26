"use client";
import * as React from "react";

export default function ERPPlaceholder({ segments }: { segments: string[] }) {
  // client-only hook ensures no server-only path executes hooks at build
  const [ready] = React.useState(true);
  return (
    <div style={{padding:24,fontFamily:"ui-sans-serif,system-ui"}}>
      <h1>ERP (temporary placeholder)</h1>
      <p>Path: /erp/{segments.join("/")}</p>
      <a href="/dashboard">← Back to Dashboard</a>
    </div>
  );
}

// Force SSR so Next never tries to statically prerender /erp/* at build time
export async function getServerSideProps(ctx: any) {
  const segments = Array.isArray(ctx.params?.rest) ? ctx.params.rest : [];
  return { props: { segments } };
}
