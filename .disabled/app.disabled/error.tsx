"use client";
export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }){
  return (
    <div style={{padding:'2rem'}}>
      <h1>Something went wrong</h1>
      <pre style={{whiteSpace:'pre-wrap'}}>{error?.message ?? 'Unknown error'}</pre>
      <button onClick={() => reset()} style={{marginTop:12}}>Try again</button>
    </div>
  );
}
