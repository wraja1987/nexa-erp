"use client";
export default function NotFound(){
  return <div style={{padding:24}}>Page not found.</div>;
}
export default function NotFound() {
  return (
    <main className="min-h-screen grid place-items-center bg-neutral-50 text-neutral-800">
      <div className="text-center p-6">
        <h1 className="text-6xl font-bold mb-3">404</h1>
        <p className="text-lg mb-6">We couldn't find that page. It may have moved.</p>
        <a href="/app" className="inline-block px-4 py-2 rounded bg-black text-white">Back to Dashboard</a>
      </div>
    </main>
  );
}

