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

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/csrf", { credentials: "include" });
        if (!res.ok) return;
        const json = await res.json();
        if (json?.csrfToken) setCsrfToken(json.csrfToken);
      } catch {
        // ignore
      }
    })();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#2F3FB5] via-[#4B3FFF] to-[#7A4DF7] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
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
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@company.com"
              className="w-full rounded-lg border-slate-200 focus:border-[#4B3FFF] focus:ring-[#4B3FFF] text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium" htmlFor="password">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-[#4B3FFF] hover:text-[#2F3FB5]"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-lg border-slate-200 focus:border-[#4B3FFF] focus:ring-[#4B3FFF] text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={!csrfToken}
            className="w-full rounded-lg bg-[#4B3FFF] hover:bg-[#2F3FB5] text-white font-semibold py-2.5 text-sm transition disabled:opacity-60"
          >
            Sign in
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-xs text-slate-400">or continue with</span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        <div className="space-y-3">
          <a
            href={`/api/auth/signin/google?callbackUrl=${encodeURIComponent(
              callbackUrl
            )}`}
            className="w-full inline-flex items-center justify-center gap-2 border border-slate-200 rounded-lg py-2 text-sm hover:bg-slate-50"
          >
            <Image src="/google.svg" alt="Google" width={20} height={20} />
            Google
          </a>
          <a
            href={`/api/auth/signin/azure-ad?callbackUrl=${encodeURIComponent(
              callbackUrl
            )}`}
            className="w-full inline-flex items-center justify-center gap-2 border border-slate-200 rounded-lg py-2 text-sm hover:bg-slate-50"
          >
            <Image src="/microsoft.svg" alt="Microsoft" width={20} height={20} />
            Microsoft
          </a>
        </div>

        <p className="text-xs text-slate-400 text-center mt-6">
          © Nexa ERP — All rights reserved
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
