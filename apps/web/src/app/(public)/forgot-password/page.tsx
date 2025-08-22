export default function ForgotPasswordPage() {
  return (
    <main>
      <h2 style={{ textAlign: 'center', marginTop: 0 }}>Reset password</h2>
      <form style={{ display: 'grid', gap: 12 }}>
        <label>
          <div style={{ fontSize: 12, marginBottom: 6 }}>Email</div>
          <input type="email" required placeholder="you@example.com" style={{ width: '100%' }} />
        </label>
        <button className="btn-primary" type="submit">Send reset link</button>
      </form>
      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <a href="/login">Back to sign in</a>
      </div>
    </main>
  )
}


