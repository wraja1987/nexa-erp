import { useState } from "react";
import { signIn } from "next-auth/react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await signIn("email", {
        email,
        redirect: false,        // stay on page; show success state
        callbackUrl: "/dashboard",
      });
      if (res?.error) {
        setErr("We couldn’t send the email. Please try again.");
      } else {
        setSent(true);
      }
    } catch {
      setErr("Network error while sending the email. Please try again.");
    } finally {
      setLoading(false);        // never hang
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold mb-2">Check your email</h1>
          <p className="text-sm text-gray-600">
            We’ve sent a secure sign-in link to <strong>{email}</strong> from{" "}
            <strong>info@nexaai.co.uk</strong>. The link expires in 15 minutes.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => window.close()}
              className="inline-flex items-center justify-center rounded-md px-4 py-2 bg-indigo-600 text-white text-sm"
            >
              Close window
            </button>
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-md px-4 py-2 border text-sm"
            >
              Back to login
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-2">Forgot your password?</h1>
        <p className="text-sm text-gray-600 mb-4">
          Enter your email and we’ll send you a secure sign-in link.
        </p>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full border rounded px-3 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded px-3 py-2 bg-indigo-600 text-white"
          >
            {loading ? "Sending..." : "Send sign-in link"}
          </button>
          {err && <p className="text-sm text-red-600">{err}</p>}
        </form>
      </div>
    </main>
  );
}


