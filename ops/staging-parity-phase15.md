Last updated: 2025-11-16

Purpose
- Document key differences between staging and production environments.
- Specify how staging should mirror production safely (without writing to production).

Who should read this
- DevOps engineers, SREs, release managers managing staging/production parity.

---

## Key Differences: Staging vs Production

### Domains and Vercel Projects

| Environment | Domain | Vercel Project |
|-------------|--------|----------------|
| **Production** | `https://app.nexaai.co.uk` | `nexa-erp-prod` (or similar) |
| **Staging** | `https://staging.nexaai.co.uk` (or similar) | `nexa-erp-staging` (or similar) |

**How to mirror**: Ensure staging domain is configured similarly to production (SSL, redirects, headers).

---

### Neon Branches / DB URLs

| Environment | Neon Branch | Database URL Pattern |
|-------------|-------------|---------------------|
| **Production** | `main` (or production branch) | `postgresql://...@ep-xxx-prod-xxx.region.neon.tech/...` |
| **Staging** | `staging` (or dedicated branch) | `postgresql://...@ep-xxx-staging-xxx.region.neon.tech/...` |

**How to mirror safely**:
1. **DO NOT write to production database from staging**
2. Periodically create a Neon branch from production: `neon branches create --project-id <id> --name staging-sync-YYYYMMDD`
3. Point staging `DATABASE_URL` to this branch
4. **DO NOT run migrations against production branch from staging**

---

### Environment Variables

#### Required Variables (Both Environments)

| Variable | Production | Staging | Notes |
|----------|------------|---------|-------|
| `DATABASE_URL` | Production Neon branch | Staging Neon branch | Different URLs |
| `NEXTAUTH_URL` | `https://app.nexaai.co.uk` | `https://staging.nexaai.co.uk` | Domain-specific |
| `NEXTAUTH_SECRET` | Production secret | Staging secret (can differ) | Different secrets OK |
| `AUTH_TRUST_HOST` | `true` | `true` | Same |
| `NODE_ENV` | `production` | `staging` or `development` | Different OK |

#### Feature Flags (Should Match)

| Variable | Production | Staging | Notes |
|----------|------------|---------|-------|
| `AI_ENGINE_ENABLED` | `true` | `true` | Should match |
| `AI_AGENT_ENABLED` | `true` | `true` | Should match |
| `HEALTHCARE_ENABLED` | `true` | `true` | Should match |
| `POS_ENABLED` | `true` | `true` | Should match |

#### Third-Party Integrations

| Variable | Production | Staging | Notes |
|----------|------------|---------|-------|
| `STRIPE_SECRET_KEY` | Production key | Test key | Different keys OK (Stripe test mode) |
| `TRUELAYER_CLIENT_ID` | Production ID | Test ID | Different IDs OK |
| `HMRC_CLIENT_ID` | Production ID | Sandbox ID | Different IDs OK |
| `GOOGLE_CLIENT_ID` | Production ID | Test ID | Different IDs OK |
| `MICROSOFT_CLIENT_ID` | Production ID | Test ID | Different IDs OK |
| `OPENAI_API_KEY` | Production key | Test key (or same) | Can differ |
| `SENTRY_DSN` | Production DSN | Staging DSN | Different DSNs OK |

#### SMTP Settings

| Variable | Production | Staging | Notes |
|----------|------------|---------|-------|
| `SMTP_HOST` | Production SMTP | Staging SMTP (or same) | Can differ |
| `SMTP_USER` | Production user | Staging user (or same) | Can differ |
| `SMTP_PASSWORD` | Production password | Staging password (or same) | Can differ |

---

## How to Maintain Staging Parity

### 1. Database Parity

**Periodic Sync** (recommended: monthly or before major releases):
```bash
# Via Neon Console:
# 1. Create branch from production: "staging-sync-YYYYMMDD"
# 2. Update staging DATABASE_URL to point to this branch
# 3. Run migrations on staging branch (not production)
```

**DO NOT**:
- Write to production database from staging
- Run destructive operations (DROP, TRUNCATE) on production branch
- Point production DATABASE_URL to staging branch

### 2. Environment Variables Parity

**Manual Copy** (recommended: quarterly or when new vars are added):
1. Export production env vars (via Vercel dashboard or CLI)
2. Review and sanitize (remove real secrets if not allowed in staging)
3. Update staging env vars in Vercel dashboard
4. Use `scripts/env/check-staging-parity.ts` to verify

**Automated Check**:
```bash
tsx scripts/env/check-staging-parity.ts
```

### 3. Feature Flags Parity

Ensure feature flags match between staging and production:
- `AI_ENGINE_ENABLED`
- `AI_AGENT_ENABLED`
- `HEALTHCARE_ENABLED`
- `POS_ENABLED`
- Any other feature flags

**Check**: Run staging parity check script to identify mismatches.

### 4. Code Parity

- Staging should deploy from the same branch/commit as production (or ahead for testing)
- Use Vercel preview deployments for feature branches
- Production should only deploy from `main` branch after staging validation

---

## Staging Parity Checklist

Use this checklist when setting up or updating staging:

- [ ] Staging domain configured (SSL, redirects, headers)
- [ ] Staging Neon branch created from production (periodic sync)
- [ ] Staging `DATABASE_URL` points to staging branch (not production)
- [ ] All required environment variables set in staging
- [ ] Feature flags match production
- [ ] Third-party integrations configured (test/sandbox keys)
- [ ] SMTP configured (can use same or different)
- [ ] Staging parity check script passes
- [ ] Staging deployment successful
- [ ] Key flows tested on staging (login, finance, inventory, HR, banking, healthcare, AI)

---

## Exempted Variables (Can Differ)

These variables are **expected** to differ between staging and production:

- `DATABASE_URL` (different Neon branches)
- `NEXTAUTH_URL` (different domains)
- `NEXTAUTH_SECRET` (can differ for security)
- `NODE_ENV` (production vs staging/development)
- Third-party API keys (production vs test/sandbox)
- `SENTRY_DSN` (different projects)
- `SMTP_*` (can differ)

---

## Troubleshooting

**Issue**: Staging behaves differently from production
- **Check**: Run `tsx scripts/env/check-staging-parity.ts` to identify differences
- **Solution**: Update staging env vars to match production (except exempted ones)

**Issue**: Staging database is out of sync
- **Check**: When was the last Neon branch sync?
- **Solution**: Create new branch from production and update staging `DATABASE_URL`

**Issue**: Feature flags don't match
- **Check**: Compare `AI_ENGINE_ENABLED`, `HEALTHCARE_ENABLED`, etc.
- **Solution**: Update staging feature flags to match production

---

## Frequency

- **Database sync**: Monthly or before major releases
- **Env var review**: Quarterly or when new vars are added
- **Parity check**: Before each staging deployment
- **Full parity audit**: Annually

