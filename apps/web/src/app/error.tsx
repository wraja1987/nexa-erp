"use client";
import React from "react";
export default function GlobalError({ error, reset }:{ error: Error & { digest?: string }, reset: () => void }) {
  return (
    <html lang="en-GB">
      <body>
        <div style={{ display:"grid", placeItems:"center", minHeight:"60vh", gap:12 }}>
          <h1>Something went wrong</h1>
          <p role="status" aria-live="polite">{error?.message || "Unexpected error"}</p>
          <button className="nexa-button" onClick={() => reset()}>Try again</button>
        </div>
      </body>
    </html>
  );
}
