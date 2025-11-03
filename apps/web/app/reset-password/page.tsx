"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";

function ResetInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const token = sp.get("token") || "";
  const [pwd, setPwd] = useState("");
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | undefined>();

  async function submit(e: any) {
    e.preventDefault();
    setErr(undefined);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password: pwd }),
    });
    const j = await res.json();
    if (j.ok) {
      setOk(true);
      setTimeout(() => router.push("/login"), 1200);
    } else {
      setErr(j.error || "FAILED");
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#6366f1_0%,_#4338ca_45%,_#0f172a_100%)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-3xl shadow-2xl border border-white/20">
        <div className="flex flex-col items-center pt-8 pb-2">
          <img src="/logo-nexa.png" alt="Nexa" className="h-10 w-auto mb-4" />
          <h1 className="text-xl font-semibold text-slate-900">Reset password</h1>
          <p className="mt-1 text-sm text-slate-500">
            Set a new password for your Nexa account.
          </p>
        </div>
        <form onSubmit={submit} className="px-8 pt-6 pb-6 space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              New password
            </label>
            <input
              id="password"
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-indigo-500 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Update password
          </button>
          {ok && <div className="text-center text-green-700 text-sm">Password updated. Redirecting…</div>}
          {err && <div className="text-center text-red-700 text-sm">{err}</div>}
        </form>
        <div className="pb-6 text-center">
          <p className="text-[11px] text-slate-400">© Nexa ERP — All rights reserved</p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetInner />
    </Suspense>
  );
}