# Depth Pass — Database URL Configuration

**Date**: 2025-01-18  
**Purpose**: Document DATABASE_URL configuration for dev and staging

---

## Database URL Sources

### Local Development

**Source**: `.env.local` or environment variables  
**Pattern**: `postgresql://postgres:postgres@localhost:5432/optra?schema=public`  
**Usage**: For local development and migration generation

**To use**:
```bash
# Load from .env.local if it exists
export DATABASE_URL="$(grep '^DATABASE_URL=' .env.local | cut -d'=' -f2-)"
# Or set manually for local dev
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/optra?schema=public"
```

### Staging

**Source**: `.env.local` (variable: `DATABASE_URL_STAGING`) or Vercel staging environment  
**Pattern**: `postgresql://...@ep-xxx-staging-xxx.region.neon.tech/...`  
**Usage**: For staging deployments and migration testing

**To use**:
```bash
# Load from .env.local
export DATABASE_URL="$(grep '^DATABASE_URL_STAGING=' .env.local | cut -d'=' -f2-)"
# Or set manually (NEVER use depth-pass-snapshot branch URL for migrations)
export DATABASE_URL="postgresql://[STAGING_BRANCH_URL]"
```

### Production

**Source**: `.env.local` (variable: `DATABASE_URL`) or Vercel production environment  
**Pattern**: `postgresql://...@ep-xxx-prod-xxx.region.neon.tech/...`  
**Usage**: For production deployments (NOT used in this phase)

---

## Important Notes

1. **DO NOT use `depth-pass-snapshot` branch URL for migrations** - it is rollback-only
2. **Staging DATABASE_URL** should point to the staging Neon branch (not production)
3. **Local dev DATABASE_URL** can point to local PostgreSQL or a dev Neon branch
4. **Always verify DATABASE_URL** before running migrations:
   ```bash
   echo $DATABASE_URL | grep -E "(production|prod|prd)" && echo "WARNING: Production URL detected!" || echo "URL appears safe"
   ```

---

**Last Updated**: 2025-01-18

