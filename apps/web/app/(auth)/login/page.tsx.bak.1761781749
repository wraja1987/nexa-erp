"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const sp = useSearchParams();
  const callbackUrl = (sp?.get("callbackUrl") || "/dashboard").toString();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [ready, setReady] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    // StrictMode-safe: run exactly once
    fetch("/api/auth/csrf", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setCsrfToken(d?.csrfToken ?? "");
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  return (
    <>
      <Link href="/" className="fixed left-6 top-6" aria-label="Nexa home">
        <Image src="/logo-nexa.png" alt="Nexa" width={112} height={28} priority />
      </Link>

      <div className="w-[420px] max-w-full p-6">
        <div className="flex items-center gap-2">
          <Image src="/logo-nexa.png" alt="NEXA" width={28} height={28} />
          <span className="sr-only">NEXA</span>
        </div>

        <h1 className="mt-8 text-center text-lg font-semibold">Sign in to Nexa ERP</h1>
        <p className="mt-1 text-center text-sm text-neutral-500">Manage your business with the Nexa AI Engine</p>

        <form className="mt-6 grid gap-3" method="post" action="/api/auth/callback/credentials">
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <input type="hidden" name="callbackUrl" value={callbackUrl} />

          <label className="text-sm font-medium">Email address</label>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="h-10 rounded-md border border-neutral-200 px-3 outline-none focus:ring-2 focus:ring-indigo-200"
          />

          <div className="flex items-center justify-between mt-2">
            <label className="text-sm font-medium">Password</label>
            <Link href="/forgot-password" className="text-sm text-indigo-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 rounded-md border border-neutral-200 px-3 outline-none focus:ring-2 focus:ring-indigo-200"
          />

          <button
            type="submit"
            disabled={!ready || !csrfToken}
            className="mt-2 h-10 rounded-md bg-indigo-600 text-white disabled:opacity-50"
          >
            {ready && csrfToken ? "Sign in" : "Preparing…"}
          </button>
        </form>

        <div className="my-4 text-center text-xs text-neutral-500">or continue with</div>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" className="flex h-10 items-center justify-center gap-2 rounded-md border border-neutral-200 hover:bg-neutral-50">
            <Image src="/icons/google.svg" alt="" width={20} height={20} />
            <span>Google</span>
          </button>
          <button type="button" className="flex h-10 items-center justify-center gap-2 rounded-md border border-neutral-200 hover:bg-neutral-50">
            <Image src="/icons/microsoft.svg" alt="" width={18} height={18} />
            <span>Microsoft</span>
          </button>
        </div>

        <p className="mt-10 text-center text-xs text-neutral-500">© Nexa ERP — All rights reserved</p>
      </div>
    </>
  );
}


