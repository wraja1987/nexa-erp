'use client';
import React from 'react';
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <html>
      <body style={{padding:'4rem 1rem', textAlign:'center'}}>
        <h1>Something went wrong</h1>
        <pre style={{whiteSpace:'pre-wrap'}}>{error?.message ?? 'Unknown error'}</pre>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
