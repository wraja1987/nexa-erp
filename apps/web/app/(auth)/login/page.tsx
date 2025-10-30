"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const sp = useSearchParams();
  const callbackUrl = (sp?.get("callbackUrl") || "/dashboard").toString();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch("/api/auth/csrf", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setCsrfToken(d?.csrfToken ?? ""))
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen w-full grid place-items-center">
      <div className="w-full max-w-md p-6">
        <div className="mb-6 flex items-center gap-2">
          <Image src="/logo-nexa.png" alt="Nexa" width={28} height={28} />
          <span className="sr-only">Nexa</span>
        </div>

        <h1 className="text-center text-lg font-semibold">Sign in to Nexa ERP</h1>
        <p className="text-center text-sm text-muted-foreground mb-6">
          Manage your business with the Nexa AI Engine
        </p>

        <form className="mt-6 grid gap-3" method="post" action="/api/auth/callback/credentials">
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <input type="hidden" name="callbackUrl" value={callbackUrl} />

          <label className="grid gap-1">
            <span className="text-sm">Email address</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-md border px-3 py-2"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border px-3 py-2"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </label>

          <button
            type="submit"
            disabled={!csrfToken}
            className="mt-2 h-10 rounded-md bg-black text-white disabled:opacity-50"
          >
            Sign in
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/forgot" className="text-sm underline">Forgot password?</Link>
        </div>

        <div className="mt-8 grid gap-2">
          <div className="text-center text-xs text-muted-foreground">or continue with</div>
          <div className="flex items-center justify-center gap-6">
            <Image src="/icons/google.svg" alt="Google" width={18} height={18} />
            <Image src="/icons/microsoft.svg" alt="Microsoft" width={18} height={18} />
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          © Nexa ERP — All rights reserved
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div />}>
      <LoginForm />
    </Suspense>
  );
}
