"use client";
export default function GlobalError({ error, reset }:{ error: Error & { digest?: string }, reset: () => void }) {
  return (
    <div style={{ padding:24, fontFamily:"system-ui" }}>
      <h1>Something went wrong</h1>
      <p role="status" aria-live="polite">{error?.message || "Unexpected error"}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
