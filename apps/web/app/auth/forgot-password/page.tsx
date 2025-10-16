"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow p-8">
        <h1 className="text-xl font-semibold">Forgot your password?</h1>
        <p className="mt-2 text-gray-600 text-sm">Enter your email and we’ll send you a secure sign-in link.</p>
        <form className="mt-6 space-y-4" onSubmit={(e)=>{e.preventDefault();}}>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2A7AE4]"
            required
          />
          <button
            type="button"
            onClick={async ()=>{ await signIn("email", { email, callbackUrl: "/dashboard" }); setSent(true); }}
            className="w-full rounded-lg bg-[#2F5EEA] px-4 py-2.5 text-white font-medium hover:opacity-95">
            Send sign-in link
          </button>
        </form>
        {sent && <p className="mt-3 text-sm text-green-700">If that email exists, a sign-in link has been sent.</p>}
      </div>
    </main>
  );
}


