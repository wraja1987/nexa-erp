# Deployment & Environments

**Local**

Dev URL: http://localhost:3001

**Production**
- Vercel (preferred for previews) or VPS with pm2 + Nginx.
- Enforce headers as per Security policy.
- Website marketing is a separate static Hostinger package.

**Secrets**
-  stores , NextAuth, Sentry DSN, etc.
- Rotate keys and keep secrets out of the repo.

**Backups/DR**
- Nightly backups; DR drill creates reports in .
