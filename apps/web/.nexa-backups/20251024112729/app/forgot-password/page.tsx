"use client";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        setError("Something went wrong");
      }
    } catch {
      setError("Network error");
    }
  }

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-semibold mb-4">Reset your password</h1>
      {success ? (
        <p>If that email exists, we’ve sent reset instructions.</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            className="w-full border rounded px-3 py-2"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
          <button className="w-full bg-blue-600 text-white rounded py-2">Send reset link</button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      )}
    </div>
  );
}


