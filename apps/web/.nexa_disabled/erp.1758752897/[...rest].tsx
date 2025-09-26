import * as React from "react";

export default function ERPPlaceholder({ segments }: { segments: string[] }) {
  // This is a simple runtime shell. No static generation.
  const [ready] = React.useState(true);
  return (
    <div style={{padding:24,fontFamily:"ui-sans-serif,system-ui"}}>
      <h1>ERP — placeholder</h1>
      <p>Path: /erp/{segments.join("/") || "(root)"}</p>
      <a href="/dashboard">← Back to Dashboard</a>
    </div>
  );
}

export async function getServerSideProps(ctx: any) {
  return { props: { segments: Array.isArray(ctx.params?.rest) ? ctx.params.rest : [] } };
}
