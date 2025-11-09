"use client";
import * as React from "react";

export default function SecuritySection({ email }: { email: string }) {
  const [sent, setSent] = React.useState<string | null>(null);
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)" }}>
      <div className="font-medium mb-2">Security</div>
      <p className="text-sm mb-3" style={{ color: "var(--color-muted)" }}>Send a password reset email.</p>
      <button className="px-4 py-2 rounded-lg text-white" style={{ background: "var(--color-blue)" }} onClick={async ()=>{
        try {
          await fetch("/api/auth/forgot-password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
          setSent("Reset email sent.");
        } catch {
          setSent("We couldn’t send the email just now. Please try again.");
        }
      }}>Send reset email</button>
      {sent && <div className="text-sm mt-2" style={{ color: "var(--color-muted)" }}>{sent}</div>}
    </div>
  );
}

