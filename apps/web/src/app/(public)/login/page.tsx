export default function LoginPage() {
  return (
    <main>
      <h2 style={{ textAlign: 'center', marginTop: 0 }}>Sign in</h2>
      <form style={{ display: 'grid', gap: 12 }}>
        <label>
          <div style={{ fontSize: 12, marginBottom: 6 }}>Email</div>
          <input type="email" required placeholder="you@example.com" style={{ width: '100%' }} />
        </label>
        <label>
          <div style={{ fontSize: 12, marginBottom: 6 }}>Password</div>
          <input type="password" required placeholder="********" style={{ width: '100%' }} />
        </label>
        <button className="btn-primary" type="submit">Continue</button>
      </form>
      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <a href="/forgot-password">Forgot password?</a>
      </div>
    </main>
  )
}


