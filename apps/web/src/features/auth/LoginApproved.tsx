import Image from 'next/image'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function LoginApproved() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background image (approved coloured background) */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/login-bg.jpg"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          {/* Logo */}
          <div className="mb-6 flex items-center justify-center">
            <Image src="/Nexa.png" alt="Nexa" width={40} height={40} />
          </div>

          {/* Heading */}
          <h1 className="text-center text-2xl font-semibold text-gray-900">
            Sign in to Nexa ERP
          </h1>
          <p className="mt-1 text-center text-sm text-gray-500">
            Manage your business with the Nexa AI Engine
          </p>

          {/* Credentials form (uses existing Credentials provider endpoint) */}
          <form
            method="post"
            action="/api/auth/callback/credentials"
            className="mt-6 space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-indigo-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-white hover:bg-indigo-700 focus:outline-none"
            >
              Sign in
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px w-full bg-gray-200" />
            <span className="text-xs text-gray-500">or continue with</span>
            <div className="h-px w-full bg-gray-200" />
          </div>

          {/* Provider buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              aria-label="Sign in with Google"
              type="button"
            >
              <Image src="/icons/google.svg" alt="" width={18} height={18} />
              Google
            </button>
            <button
              onClick={() => signIn('azure-ad', { callbackUrl: '/dashboard' })}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              aria-label="Sign in with Microsoft"
              type="button"
            >
              <Image src="/icons/microsoft.svg" alt="" width={18} height={18} />
              Microsoft
            </button>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-gray-400">
            © Nexa ERP — All rights reserved
          </p>
        </div>
      </div>
    </div>
  )
}


