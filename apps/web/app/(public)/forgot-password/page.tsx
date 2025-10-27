export default function ForgotPassword() {
  return (
    <div className="grid place-items-center min-h-screen p-6">
      <div className="nexa-card w-full max-w-md p-8">
        <div className="flex justify-center mb-4">
          <img src="/logo-nexa.png" alt="Nexa" className="h-9 w-auto" />
        </div>
        <h1 className="text-center text-xl font-semibold mb-1">Reset your password</h1>
        <p className="text-center text-sm text-black/60 mb-6">We’ll email you a reset link.</p>
        <form className="space-y-3">
          <input className="w-full rounded-md border px-3 py-2" placeholder="you@company.com" />
          <button className="w-full rounded-md bg-[#2b68ff] text-white font-medium py-2.5">Send reset link</button>
        </form>
      </div>
    </div>
  );
}


