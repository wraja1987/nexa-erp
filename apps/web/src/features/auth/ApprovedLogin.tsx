"use client";
import Image from "next/image";
import { signIn } from "next-auth/react";

export default function ApprovedLogin() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/images/login-bg-approved.jpg?v=1')" }}
    >
      <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-6">
          <Image src="/Nexa.png" alt="Nexa" width={36} height={36} priority />
        </div>

        <h1 className="text-2xl font-semibold text-center">Sign in to Nexa ERP</h1>
        <p className="text-center text-sm text-gray-500 mt-1">
          Manage your business with the Nexa AI Engine
        </p>

        <label className="block text-sm font-medium mt-6">Email address</label>
        <input
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="you@company.com"
          type="email"
          name="email"
          autoComplete="username"
        />

        <div className="mt-4 flex items-center justify-between">
          <label className="text-sm font-medium">Password</label>
          <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
            Forgot password?
          </a>
        </div>
        <input
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
          type="password"
          name="password"
          autoComplete="current-password"
        />

        <button className="mt-6 w-full rounded-lg bg-blue-600 text-white py-2.5 hover:bg-blue-700 transition">
          Sign in
        </button>

        <div className="my-6 flex items-center">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="mx-3 text-xs uppercase text-gray-400">or continue with</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="border rounded-lg py-2.5 flex items-center justify-center hover:bg-gray-50"
          >
            <Image src="/icons/google.svg" alt="Google" width={18} height={18} />
            <span className="ml-2 text-sm">Google</span>
          </button>
          <button
            onClick={() => signIn("azure-ad", { callbackUrl: "/dashboard" })}
            className="border rounded-lg py-2.5 flex items-center justify-center hover:bg-gray-50"
          >
            <Image src="/icons/microsoft.svg" alt="Microsoft" width={18} height={18} />
            <span className="ml-2 text-sm">Microsoft</span>
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          © Nexa ERP — All rights reserved
        </p>
      </div>
    </div>
  );
}
