"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      <Link href="/" className="fixed left-6 top-6" aria-label="Nexa home">
        <Image src="/logo-nexa.png" alt="Nexa" width={112} height={28} priority />
      </Link>

      <div className="w-full max-w-md rounded-2xl bg-white/70 backdrop-blur-md shadow-xl p-8">
        <div className="flex justify-center mb-4">
          <Image src="/logo-nexa.png" alt="Nexa" width={80} height={20} />
        </div>

        <h1 className="text-center text-xl font-semibold">Sign in to Nexa ERP</h1>
        <p className="mt-1 text-center text-sm text-neutral-600">
          Manage your business with the Nexa AI Engine
        </p>

        <form className="mt-6 grid gap-3" method="post" action="/api/auth/callback/credentials">
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
            className="mt-3 h-10 rounded-md bg-indigo-600 text-white font-medium hover:opacity-95"
          >
            Sign in
          </button>
        </form>

        <div className="my-4 text-center text-xs text-neutral-500">or continue with</div>

        <div className="grid grid-cols-2 gap-3">
          <form method="post" action="/api/auth/signin/google" className="contents">
            <button type="submit" className="flex h-10 items-center justify-center gap-2 rounded-md border border-neutral-200 hover:bg-neutral-50">
              <Image src="/icons/google.svg" alt="" width={20} height={20} />
              <span>Google</span>
            </button>
          </form>
          <form method="post" action="/api/auth/signin/azure-ad" className="contents">
            <button type="submit" className="flex h-10 items-center justify-center gap-2 rounded-md border border-neutral-200 hover:bg-neutral-50">
              <Image src="/icons/microsoft.svg" alt="" width={18} height={18} />
              <span>Microsoft</span>
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-500">© Nexa ERP — All rights reserved</p>
      </div>
    </>
  );
}


