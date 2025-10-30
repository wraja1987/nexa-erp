"use client";


import Image from "next/image";
import Link from "next/link";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";


function LoginForm() {
  const search = useSearchParams();
  const callbackUrl = (search?.get("callbackUrl") || "/dashboard").toString();

  const [csrfToken, setCsrfToken] = useState("");
  const fetched = useRef(false);

  // keep the working CSRF flow
  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/csrf", {
          credentials: "include",
        });
        if (!res.ok) return;
        const json = await res.json();
        if (json?.csrfToken) {
          setCsrfToken(json.csrfToken);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2E3B8F] via-[#4C3BCF] to-[#6A4DFF] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo-nexa.png"
            alt="Nexa"
            width={90}
            height={32}
            priority
            className="h-10 w-auto"
          />
        </div>

        <h1 className="text-2xl font-semibold text-center text-slate-900 mb-1">
          Sign in to Nexa ERP
        </h1>
        <p className="text-center text-slate-500 mb-6 text-sm">
          Manage your business with the Nexa AI Engine
        </p>

        <form
          method="post"
          action="/api/auth/callback/credentials"
          className="space-y-4"
        >
          <input type="hidden" name="csrfToken" value={csrfToken} readOnly />
          <input type="hidden" name="callbackUrl" value={callbackUrl} readOnly />

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              className="w-full rounded-lg border-slate-200 focus:border-[#4C3BCF] focus:ring-[#4C3BCF] text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-[#4C3BCF] hover:text-[#2E3B8F]"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-lg border-slate-200 focus:border-[#4C3BCF] focus:ring-[#4C3BCF] text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={!csrfToken}
            className="w-full inline-flex justify-center items-center rounded-lg bg-[#4C3BCF] hover:bg-[#2E3B8F] text-white font-semibold py-2.5 text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Sign in
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-[11px] uppercase tracking-wide text-slate-400">
            or continue with
          </span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <form action="/api/auth/signin/google" method="post">
            <button
              type="submit"
              className="w-full border border-slate-200 rounded-lg py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Google
            </button>
          </form>
          <form action="/api/auth/signin/azure-ad" method="post">
            <button
              type="submit"
              className="w-full border border-slate-200 rounded-lg py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Microsoft
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-400">
          © Nexa ERP — All rights reserved
        </p>
      </div>
    </div>
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100" />}>
      <LoginForm />
    </Suspense>
  );
}
