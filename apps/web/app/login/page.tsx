export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export const dynamic = "force-static";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  return (
    <main className="min-h-screen w-full bg-[radial-gradient(1200px_600px_at_70%_10%,#7C4DFF_0%,transparent_40%),radial-gradient(1000px_500px_at_10%_20%,#2A7AE4_0%,transparent_40%),linear-gradient(180deg,#1E3A8A_0%,#1B2B5B_100%)] flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="mx-auto w-full max-w-lg rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 p-8 sm:p-10">
          {/* top logo */}
          <div className="mx-auto mb-6 h-10 w-10 grid place-items-center rounded-xl bg-[#0B3C95]/10">
            <img src="/nexa-logo.svg" alt="Nexa ERP" className="h-6 w-6" />
          </div>

          {/* heading + subheading */}
          <h1 className="text-center text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">
            Sign in to Nexa ERP
          </h1>
          <p className="mt-2 text-center text-sm text-gray-500">
            Manage your business with the Nexa AI Engine
          </p>

          {/* form */}
          <form className="mt-8 space-y-5" onSubmit={(e)=>{e.preventDefault();}}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                id="email"
                type="email"
                inputMode="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2A7AE4]"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <Link href="/auth/forgot-password" className="text-sm text-[#2A7AE4] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2A7AE4]"
                required
              />
            </div>

            <button
              type="button"
              onClick={() => signIn("credentials", { email, callbackUrl: "/dashboard" })}
              className="w-full rounded-xl bg-[#2F5EEA] px-4 py-3 text-white font-medium hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2F5EEA]">
              Sign in
            </button>
          </form>

          {/* divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs uppercase tracking-wider text-gray-500">
                  or continue with
                </span>
              </div>
            </div>
          </div>

          {/* providers */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2A7AE4]">
              Google
            </button>
            <button
              type="button"
              onClick={() => signIn("azure-ad", { callbackUrl: "/dashboard" })}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2A7AE4]">
              Microsoft
            </button>
          </div>

          {/* footer */}
          <p className="mt-8 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Nexa ERP — All rights reserved
          </p>
        </div>
      </div>
    </main>
  );
}


