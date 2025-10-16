'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#1e3a8a] to-[#6d28d9] flex items-center justify-center px-4 py-10">
      <main className="w-full max-w-5xl bg-white/95 shadow-2xl rounded-2xl grid md:grid-cols-[1.15fr_1fr] overflow-hidden">
        <section className="p-10 md:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#7c3aed] grid place-items-center shadow-lg">
              <Image src="/brand/nexa-mark.svg" alt="Nexa" width={48} height={48} priority />
            </div>
            <div className="font-extrabold tracking-wide">Nexa ERP</div>
          </div>

          <h1 className="text-3xl font-semibold">Sign in to Nexa ERP</h1>
          <p className="mt-2 text-sm text-slate-600">Manage your business with the Nexa AI Engine</p>

          <form className="mt-8 space-y-5" action="/api/auth/callback/credentials" method="post" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2">Email address</label>
              <input id="email" name="email" type="email" autoComplete="email" required
                     placeholder="you@company.com"
                     className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold mb-2">Password</label>
                <Link href="/auth/forgot-password" className="text-sm text-indigo-600 hover:underline">Forgot password?</Link>
              </div>
              <input id="password" name="password" type="password" autoComplete="current-password" required
                     placeholder="••••••••"
                     className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>
            <button type="submit"
                    className="w-full rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white py-3 font-semibold shadow-md hover:opacity-95">
              Sign in
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="px-3 text-xs uppercase text-slate-500">or continue with</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a href="/api/auth/signin/google?callbackUrl=%2Fdashboard"
               className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white py-3 font-medium hover:bg-slate-50 transition">
              Google
            </a>
            <a href="/api/auth/signin/azure-ad?callbackUrl=%2Fdashboard"
               className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white py-3 font-medium hover:bg-slate-50 transition">
              Microsoft
            </a>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">© Nexa ERP — All rights reserved</p>
        </section>

        <aside className="hidden md:grid place-items-center p-8 bg-gradient-to-br from-blue-500/90 to-purple-600/90 text-white text-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-2 rounded-lg text-sm mb-4">
              <span>⚡</span> <span>AI-assisted workflows</span>
            </div>
            <h2 className="text-2xl font-semibold">Welcome back</h2>
            <p className="opacity-90 mt-2">Single sign-on with Google or Microsoft. Your data stays protected with enterprise-grade security.</p>
            <ul className="mt-4 text-left space-y-2 text-sm">
              <li>✓ Role-based access control</li>
              <li>✓ Multi-tenant architecture</li>
              <li>✓ Audit trails & SSO</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}


