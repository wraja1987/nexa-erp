"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";

function ResetInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const token = sp.get("token") || "";
  const [pwd,setPwd]=useState(""); const [ok,setOk]=useState(false); const [err,setErr]=useState<string|undefined>();
  async function submit(e:any){ e.preventDefault(); setErr(undefined);
    const res = await fetch("/api/auth/reset-password",{method:"POST",headers:{'content-type':'application/json'},body:JSON.stringify({ token, password: pwd })});
    const j = await res.json(); if(j.ok){ setOk(true); setTimeout(()=>router.push("/login"),1200); } else { setErr(j.error||"FAILED"); }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <form onSubmit={submit} className="w-full max-w-md p-8 rounded-2xl bg-white shadow space-y-4">
        <h1 className="text-2xl font-semibold">Set a new password</h1>
        <input value={pwd} onChange={e=>setPwd(e.target.value)} type="password" placeholder="New password" className="w-full border rounded-xl px-4 py-3" />
        <button className="w-full bg-nexa-blue text-white rounded-xl py-3">Update password</button>
        {ok && <div className="text-green-700 text-sm">Password updated. Redirecting…</div>}
        {err && <div className="text-red-700 text-sm">{err}</div>}
      </form>
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