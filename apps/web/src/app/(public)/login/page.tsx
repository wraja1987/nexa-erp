"use client";
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { hasGoogle, hasMicrosoft } from '@/lib/env/auth'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    await signIn('credentials', { email, password, callbackUrl: '/' })
  }

  return (
    <main role="main" style={{ maxWidth: 400, margin: '40px auto', padding: 16 }}>
      <h1 style={{ textAlign: 'center', marginTop: 0 }}>Sign in</h1>
      {error && (
        <div role="alert" style={{ color: 'red', marginBottom: 12 }}>
          {error}
        </div>
      )}
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          <div style={{ fontSize: 12, marginBottom: 6 }}>Email</div>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required placeholder="you@example.com" style={{ width: '100%' }} />
        </label>
        <label>
          <div style={{ fontSize: 12, marginBottom: 6 }}>Password</div>
          <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required placeholder="********" style={{ width: '100%' }} />
        </label>
        <button className="btn-primary" type="submit">Continue</button>
      </form>

      {(hasGoogle() || hasMicrosoft()) && (
        <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
          {hasGoogle() && (
            <button onClick={() => signIn('google', { callbackUrl: '/' })}>Sign in with Google</button>
          )}
          {hasMicrosoft() && (
            <button onClick={() => signIn('azure-ad', { callbackUrl: '/' })}>Sign in with Microsoft</button>
          )}
        </div>
      )}
    </main>
  )
}


