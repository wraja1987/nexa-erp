"use client";
import * as React from "react";

/** Minimal client page to avoid static prerender crashes. */
export default function HRPage() {
  const [ready] = React.useState(true);
  return (
    <div style={{padding:24,fontFamily:"ui-sans-serif,system-ui"}}>
      <h1>HR — (placeholder)</h1>
      <p>This page renders client-side. Replace with your real content later.</p>
      <a href="/dashboard">← Back to Dashboard</a>
    </div>
  );
}

/** Force SSR so Next won’t try to prerender this route during build. */
export async function getServerSideProps() {
  return { props: {} };
}
