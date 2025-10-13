import { useState } from "react";
import Head from "next/head";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn("credentials", { redirect: true, email, password, callbackUrl: "/dashboard" });
    setLoading(false);
  }

  return (
    <>
      <Head><title>Sign in — Nexa ERP</title><meta name="robots" content="noindex"/></Head>
      <div className="min-h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-violet-700 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white shadow-xl rounded-2xl p-8 sm:p-10">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <img src="/Nexa.png" alt="Nexa" height="44" loading="eager" className="mx-auto mb-2 h-11 w-auto" />
              </div>
              <h1 className="text-3xl font-semibold text-gray-900">Sign in to Nexa ERP</h1>
              <p className="text-sm text-gray-500">Manage your business with the Nexa AI Engine</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-600 focus:border-blue-600"
                  placeholder="you@company.com" autoComplete="email"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-600 focus:border-blue-600"
                  placeholder="••••••••" autoComplete="current-password"/>
                <div className="text-right mt-1">
                  <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-md bg-blue-600 text-white font-medium hover:brightness-110 transition disabled:opacity-60">
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="h-px bg-gray-200 w-full" />
              <span className="text-xs text-gray-500">or continue with</span>
              <div className="h-px bg-gray-200 w-full" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button type="button"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="py-2.5 rounded-md border border-gray-300 hover:bg-gray-50 transition flex items-center justify-center gap-2"
                aria-label="Continue with Google">
                <img src="/icons/google.svg" alt="" width={18} height={18} loading="lazy" />
                <span>Google</span>
              </button>

              <button type="button"
                onClick={() => signIn("microsoft", { callbackUrl: "/dashboard" })}
                className="py-2.5 rounded-md border border-gray-300 hover:bg-gray-50 transition flex items-center justify-center gap-2"
                aria-label="Continue with Microsoft">
                <img src="/icons/microsoft.svg" alt="" width={18} height={18} loading="lazy" />
                <span>Microsoft</span>
              </button>
            </div>

            <p className="mt-8 text-center text-xs text-gray-400">© Nexa ERP — All rights reserved</p>
          </div>
        </div>
      </div>
    </>
  );
}
