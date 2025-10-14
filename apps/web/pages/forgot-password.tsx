import { useState } from "react";
import { signIn } from "next-auth/react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await signIn("email", {
      email,
      redirect: false,
      callbackUrl: "/dashboard",
    });
    setLoading(false);
    if (res?.error) setErr("We could not send the email. Please try again in a moment.");
    else setSent(true);
  }

  if (sent) {
    return (
      <main className="mx-auto max-w-md p-6">
        <h1 className="text-xl font-semibold mb-2">Check your email</h1>
        <p>We’ve sent a secure sign-in link to <strong>{email}</strong> from <strong>info@nexaai.co.uk</strong>. The link expires in 15 minutes.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold mb-3">Forgot your password?</h1>
      <p className="mb-4">Enter your email and we’ll send you a secure sign-in link.</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full border rounded px-3 py-2"
        />
        <button disabled={loading} className="w-full rounded px-3 py-2 bg-blue-600 text-white">
          {loading ? "Sending…" : "Send sign-in link"}
        </button>
        {err && <p className="text-red-600">{err}</p>}
      </form>
    </main>
  );
}


