"use client";
import { useEffect } from "react";

export default function Error({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const correlationId = error?.digest;

  return (
    <main className="min-h-screen grid place-items-center bg-neutral-50 text-neutral-800">
      <div className="text-center p-6 max-w-xl">
        <h1 className="text-4xl font-semibold mb-3">Something went wrong</h1>
        <p className="mb-4">We're tracking this issue. Please try again shortly.</p>
        {correlationId ? (
          <p className="text-sm text-neutral-500">Correlation ID: {correlationId}</p>
        ) : null}
        <div className="mt-6">
          <a href="/app" className="inline-block px-4 py-2 rounded bg-black text-white">Back to Dashboard</a>
        </div>
      </div>
    </main>
  );
}

