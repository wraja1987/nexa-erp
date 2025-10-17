export default function ForgotSuccessApproved() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#60a5fa] grid place-items-center p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Check your email</h1>
        <p className="mt-2 text-slate-600">
          We’ve sent a secure sign-in link. It expires shortly — open it from the same device & browser.
        </p>
        <a href="/login" className="mt-6 inline-block rounded-lg bg-[#2563EB] px-4 py-2.5 text-white font-medium hover:opacity-90 transition">
          Back to login
        </a>
      </div>
    </div>
  );
}


