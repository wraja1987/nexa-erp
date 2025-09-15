export default function LoginPage() {
  return (
    <div className="space-y-8">
      <section className="mt-8">
        <div className="hero-band">
          <h1 className="text-3xl md:text-4xl font-semibold">Login</h1>
          <p className="mt-2 opacity-90">Branded login form (demo only).</p>
        </div>
      </section>
      <form className="max-w-md grid gap-4">
        <input className="rounded-md border p-3" name="email" placeholder="Email" type="email" required />
        <input className="rounded-md border p-3" name="password" placeholder="Password" type="password" required />
        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" /> Remember me
        </label>
        <button type="button" className="btn-primary" aria-disabled="true">Sign in (disabled)</button>
        <div className="text-sm">
          <a href="/contact#support" className="underline">Forgot password?</a> · <a href="/" className="underline">Back to Home</a>
        </div>
      </form>
    </div>
  )
}



