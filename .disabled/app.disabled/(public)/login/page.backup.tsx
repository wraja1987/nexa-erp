"use client";

export default function LoginPage() {
  // Read ?error=... only on the client (Next 15: avoid useSearchParams unless inside Suspense)
  const error: string | null =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("error")
      : null;

  return (
    <div className="login-page">
      <h1>Nexa ERP — Login</h1>
      {error && <p className="text-red-600">Error: {error}</p>}
      {/* Existing login form goes here */}
    </div>
  );
}
