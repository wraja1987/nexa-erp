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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D42FF] via-[#1B1F3B] to-[#030616] text-white">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur border border-white/10 shadow">
        <div className="mb-8 flex items-center justify-center">
          <img src="/logo-nexa.png" alt="Nexa" width={140} height={40} />
        </div>
        <button onClick={() => signIn('google', { callbackUrl })} className="w-full mb-3 border border-white/20 rounded-xl py-3 hover:bg-white/10">Continue with Google</button>
        <button onClick={() => signIn('azure-ad', { callbackUrl })} className="w-full mb-6 border border-white/20 rounded-xl py-3 hover:bg-white/10">Continue with Microsoft</button>
        <form method="post" action="/api/auth/callback/credentials" className="space-y-3">
          <input type="hidden" name="csrfToken" value={csrfToken || ""} />
          <input name="email" placeholder="Email" className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/20 placeholder-white/60 text-white" />
          <input name="password" type="password" placeholder="Password" className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/20 placeholder-white/60 text-white" />
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <button className="w-full bg-[#0D42FF] text-white rounded-xl py-3">Sign in</button>
        </form>
        <div className="mt-4 text-center">
          <a href="/forgot-password" className="text-sm underline text-white/90 hover:text-white">Forgot password?</a>
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