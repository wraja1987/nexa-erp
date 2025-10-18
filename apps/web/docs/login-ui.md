# Nexa — Approved Login UI

Last updated: 2025-10-17

Route: /login
Component: src/features/auth/LoginApproved.tsx

Assets:
- /public/Nexa.png
- /public/icons/google.svg
- /public/icons/microsoft.svg
- /public/images/login-bg.jpg

Auth wiring:
- Credentials posts to /api/auth/callback/credentials
- Google: signIn('google', { callbackUrl: '/dashboard' })
- Microsoft: signIn('azure-ad', { callbackUrl: '/dashboard' })

Runtime requirements (do not change):
- Providers: email, google, azure-ad
- Cookies: Secure, HttpOnly, SameSite=Lax
- MFA enforced for super_admin + admin
- /api/_auth-diag must be all green
