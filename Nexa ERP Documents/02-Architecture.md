# Architecture

Stack: Next.js 14, React 18, TypeScript, Prisma/Postgres, Redis, Docker.  
Auth: NextAuth, RBAC, tenant guard.  
Key endpoints: , .  
Security headers: static long-cache, API no-store, HTML s-maxage; CSP, Referrer-Policy, XFO enforced.
JSON-driven UI: every module has JSON, page, and sidebar entry; verified by scripts.
