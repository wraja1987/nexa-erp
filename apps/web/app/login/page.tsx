import type { Metadata } from 'next'
import LoginApproved from '@/src/features/auth/LoginApproved'

export const metadata: Metadata = {
  title: 'Sign in to Nexa ERP'
}

export default function Page() {
  return <LoginApproved />
}

<!doctype html><html lang='en'><head><meta charset='utf-8'/><meta name='viewport' content='width=device-width, initial-scale=1'/><title>Nexa ERP — Sign in</title><style>
:root{--nexa-blue:#2563eb;--nexa-indigo:#4f46e5;--nexa-purple:#7c3aed;--nexa-bg-start:#1e3a8a;--nexa-bg-end:#6d28d9;--card-bg:#ffffff;--text:#0f172a;--muted:#475569;--border:#e5e7eb}
html,body{height:100%}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;background:linear-gradient(135deg,var(--nexa-bg-start),var(--nexa-bg-end));display:flex;align-items:center;justify-content:center;padding:32px;color:var(--text)}
.card{width:min(880px,94vw);background:var(--card-bg);box-shadow:0 15px 60px rgba(17,24,39,.25);border-radius:20px;overflow:hidden;display:grid;grid-template-columns:1.15fr 1fr}
.panel{padding:40px 44px;display:flex;flex-direction:column;justify-content:center}
.brand{display:flex;align-items:center;gap:14px;margin-bottom:20px}
.brand-logo{width:50px;height:50px;border-radius:12px;background:linear-gradient(135deg,var(--nexa-blue),var(--nexa-purple));display:grid;place-items:center;color:#fff;font-weight:800;font-size:26px;box-shadow:0 6px 18px rgba(37,99,235,.45)}
h1{font-size:30px;margin:10px 0 6px 0}.sub{color:var(--muted);font-size:15px;margin-bottom:32px}
form{display:flex;flex-direction:column;gap:20px}
label{font-size:14px;font-weight:600;margin-bottom:6px}
input{width:100%;padding:14px 14px;font-size:16px;border:1px solid var(--border);border-radius:10px;outline:none;box-sizing:border-box}
input:focus{border-color:var(--nexa-indigo);box-shadow:0 0 0 4px rgba(79,70,229,.15)}
.row{display:flex;align-items:center;justify-content:space-between;margin-top:-10px;margin-bottom:10px}
.a{color:var(--nexa-indigo);text-decoration:none;font-weight:600}
.btn{width:100%;padding:14px 16px;border-radius:10px;border:0;cursor:pointer;font-size:16px;font-weight:700}
.btn-primary{background:linear-gradient(135deg,var(--nexa-indigo),var(--nexa-purple));color:#fff;box-shadow:0 8px 24px rgba(79,70,229,.35)}
.or{display:flex;align-items:center;gap:12px;color:var(--muted);font-size:12px;margin:20px 0}.or:before,.or:after{content:'';height:1px;background:#e5e7eb;flex:1}
.sso{display:grid;grid-template-columns:1fr 1fr;gap:12px}.btn-sso{display:flex;align-items:center;justify-content:center;gap:10px;background:#f8fafc;color:#111827;border:1px solid #e5e7eb}.btn-sso:hover{background:#f1f5f9}.sso svg{width:18px;height:18px}
.art{background:linear-gradient(135deg,rgba(59,130,246,.95),rgba(124,58,237,.95));display:grid;place-items:center;padding:24px;color:#fff;text-align:center}
.hero h2{font-size:32px;margin-bottom:10px}.hero p{opacity:.9;margin:0;max-width:320px}
@media (max-width:960px){.card{grid-template-columns:1fr}.art{display:none}}
</style></head>
<body>
  <main class="card" role="main">
    <section class="panel">
      <div class="brand">
        <div class="brand-logo">N</div>
        <div style="font-weight:800;letter-spacing:.4px">Nexa ERP</div>
      </div>
      <h1>Sign in to Nexa ERP</h1>
      <p class="sub">Manage your business with the Nexa AI Engine</p>

      <form action="https://app.nexaai.co.uk/api/auth/callback/credentials" method="post" novalidate>
        <div>
          <label for="email">Email address</label>
          <input id="email" name="email" type="email" autocomplete="email" placeholder="you@company.com" required />
        </div>
        <div>
          <label for="password">Password</label>
          <input id="password" name="password" type="password" autocomplete="current-password" placeholder="••••••••" required />
        </div>
        <div class="row">
          <span></span>
          <a class="a" href="https://app.nexaai.co.uk/auth/forgot-password">Forgot password?</a>
        </div>
        <button class="btn btn-primary" type="submit">Sign in</button>
      </form>

      <div class="or">or continue with</div>
      <div class="sso">
        <a class="btn btn-sso" href="https://app.nexaai.co.uk/api/auth/signin/google">
          <svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.7 6.1 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7L12.6 19.3C14.3 15.3 18.7 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.7 6.1 29.1 4 24 4 15.6 4 8.5 8.8 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.3-5.2l-6.1-5c-2 1.4-4.7 2.2-7.2 2.2-5.3 0-9.7-3.4-11.3-8.1l-6.2 4.8C8.6 39.1 15.8 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.3 3.6-4.7 6-8.3 6-5.3 0-9.7-3.4-11.3-8.1l-6.2 4.8C8.6 39.1 15.8 44 24 44c11.1 0 20-8.9 20-20 0-1.2-.1-2.3-.4-3.5z"/></svg>
          Google
        </a>
        <a class="btn btn-sso" href="https://app.nexaai.co.uk/api/auth/signin/azure-ad">
          <svg viewBox="0 0 23 23" aria-hidden="true"><path fill="#f25022" d="M0 0h10.35v10.35H0z"/><path fill="#00a4ef" d="M12.65 0H23v10.35H12.65z"/><path fill="#7fba00" d="M0 12.65h10.35V23H0z"/><path fill="#ffb900" d="M12.65 12.65H23V23H12.65z"/></svg>
          Microsoft
        </a>
      </div>
    </section>
    <aside class="art">
      <div class="hero">
        <h2>Welcome back</h2>
        <p>Sign in securely with Nexa ERP’s AI-powered workspace.</p>
      </div>
    </aside>
  </main>
</body></html>