"use client";

import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-0px)] grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-lg shadow-xl ring-1 ring-white/15 p-8 text-white">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/logo-nexa.png"
              alt="Nexa"
              width={56}
              height={56}
              className="h-14 w-14"
            />
          </div>

          {/* Title */}
          <h1 className="text-center text-2xl font-semibold">Sign in to Nexa ERP</h1>
          <p className="mt-1 text-center text-sm text-white/80">
            Manage your business with the Nexa AI Engine
          </p>

          {/* Form */}
          <form
            method="POST"
            action="/api/auth/callback/credentials"
            className="mt-8 space-y-4"
          >
            {/* email */}
            <div>
              <label htmlFor="email" className="block text-sm mb-1">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            {/* password + forgot */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm mb-1">Password</label>
                <Link href="/forgot-password" className="text-sm text-white hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            {/* sign in button */}
            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-[#2F66F5] px-4 py-2.5 font-medium text-white shadow hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              Sign in
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-transparent px-2 text-white/80">or continue with</span>
            </div>
          </div>

          {/* OAuth buttons */}
          <div className="grid grid-cols-2 gap-3">
            <form action="/api/auth/signin/google" method="POST">
              <button
                type="submit"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white hover:brightness-110"
              >
                Google
              </button>
            </form>
            <form action="/api/auth/signin/azure-ad" method="POST">
              <button
                type="submit"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white hover:brightness-110"
              >
                Microsoft
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-xs text-white/60">
            © Nexa ERP — All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}