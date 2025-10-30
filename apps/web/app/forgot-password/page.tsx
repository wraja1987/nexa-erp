export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow">
        <h1 className="text-xl font-semibold mb-2">Reset your password</h1>
        <p className="text-sm text-slate-500 mb-4">
          Enter your email and we will send you a reset link (if SMTP is configured).
        </p>
        <form method="post" action="/api/auth/forgot-password" className="space-y-3">
          <input
            name="email"
            type="email"
            required
            placeholder="you@company.com"
            className="w-full rounded-lg border-slate-200 focus:border-slate-500 focus:ring-slate-500"
          />
          <button
            type="submit"
            className="w-full bg-slate-900 text-white rounded-lg py-2 text-sm font-medium"
          >
            Send reset link
          </button>
        </form>
      </div>
    </div>
  );
}
