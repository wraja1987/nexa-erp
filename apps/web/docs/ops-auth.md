## Auth setup

Environment variables required:
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET (optional)
- MICROSOFT_CLIENT_ID / MICROSOFT_CLIENT_SECRET (optional)
- MICROSOFT_TENANT_ID (optional)

Seed an admin user (local):
```
pnpm --filter ./apps/web run seed:admin
```
Creates or updates `admin@nexa.local` with password `NexaAdmin!123`.


