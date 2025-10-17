"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function LoginApproved() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#60a5fa] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Image src="/brand/nexa-mark.svg" alt="Nexa" width={32} height={32} />
          <span className="text-sm font-medium text-slate-500">Nexa ERP</span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">Sign in to Nexa ERP</h1>
        <p className="mt-1 text-sm text-slate-600">Manage your business with the Nexa AI Engine</p>

        <form method="post" action="/api/auth/signin/credentials" className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email address</label>
            <input
              name="email" type="email" required value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <Link href="/auth/forgot-password" className="text-sm text-[#2563EB] hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              name="password" type="password" required value={password}
              onChange={(e)=>setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-[#2563EB] px-4 py-2.5 text-white font-medium hover:opacity-90 transition"
          >
            Sign in
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500">or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <a href="/api/auth/signin/google" className="rounded-lg border border-slate-300 bg-white py-2.5 text-center text-slate-700 hover:bg-slate-50">Google</a>
          <a href="/api/auth/signin/azure-ad" className="rounded-lg border border-slate-300 bg-white py-2.5 text-center text-slate-700 hover:bg-slate-50">Microsoft</a>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">© Nexa ERP — All rights reserved</p>
      </div>
    </div>
  );
}


