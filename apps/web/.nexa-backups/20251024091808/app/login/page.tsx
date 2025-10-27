"use client";
import { signIn, getCsrfToken } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function LoginInner() {
  const [csrfToken, setCsrfToken] = useState<string | undefined>(undefined);
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") || "/dashboard";
  useEffect(() => {
    (async () => {
      try {
        const t = await getCsrfToken();
        setCsrfToken(t || undefined);
      } catch {
        setCsrfToken(undefined);
      }
    })();
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white shadow">
        <div className="mb-8 flex items-center justify-center">
          <img src="/logo-nexa.png" alt="Nexa" width={220} height={64} className="h-16 w-auto" />
        </div>
        <button onClick={() => signIn('google', { callbackUrl })} className="w-full mb-3 border rounded-xl py-3">Continue with Google</button>
        <button onClick={() => signIn('azure-ad', { callbackUrl })} className="w-full mb-6 border rounded-xl py-3">Continue with Microsoft</button>
        <form method="post" action="/api/auth/callback/credentials" className="space-y-3">
          <input type="hidden" name="csrfToken" value={csrfToken || ""} />
          <input name="email" placeholder="Email" className="w-full border rounded-xl px-4 py-3" />
          <input name="password" type="password" placeholder="Password" className="w-full border rounded-xl px-4 py-3" />
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <button className="w-full bg-nexa-blue text-white rounded-xl py-3">Sign in</button>
        </form>
        <div className="mt-4 text-center">
          <a href="/forgot-password" className="text-sm text-nexa-blue underline">Forgot password?</a>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}