"use client";

import React from "react";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [callbackUrl, setCallbackUrl] = useState<string>("/dashboard");

  useEffect(() => {
    // Fetch NextAuth CSRF token for credentials flow
    fetch("/api/auth/csrf")
      .then((r) => r.json())
      .then((d) => setCsrfToken(d?.csrfToken || ""))
      .catch(() => setCsrfToken(""));

    // Preserve redirect target if present
    try {
      const u = new URL(window.location.href);
      const cb = u.searchParams.get("callbackUrl");
      if (cb) setCallbackUrl(cb);
    } catch {}
  }, []);
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#6366f1_0%,_#4338ca_45%,_#0f172a_100%)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-3xl shadow-2xl border border-white/20">
        <div className="flex flex-col items-center pt-8 pb-2">
          <img src="/logo-nexa.png" alt="Nexa" className="h-10 w-auto mb-4" />
          <h1 className="text-xl font-semibold text-slate-900">Sign in to Nexa ERP</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your business with the Nexa AI Engine
          </p>
        </div>

        <form
          method="post"
          action="/api/auth/callback/credentials"
          className="px-8 pt-6 pb-6 space-y-4"
        >
          {/* Required hidden inputs for NextAuth credentials flow */}
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <a
                href="/forgot-password"
                className="text-xs font-medium text-indigo-500 hover:text-indigo-600"
              >
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-indigo-500 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Sign in
          </button>
        </form>

        <div className="py-4 px-8 pb-6 text-center">
          <p className="text-[11px] text-slate-400">© Nexa ERP — All rights reserved</p>
        </div>
      </div>
    </div>
  );
}
