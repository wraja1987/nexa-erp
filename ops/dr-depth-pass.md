# Depth Pass — Disaster Recovery & Migration Procedures

**Date**: 2025-01-18  
**Purpose**: DR procedures for Depth Pass schema migrations

---

## Neon Snapshot Creation

### Before First Migration

**Create Neon Branch/Snapshot**:

```bash
# Using Neon CLI (if installed)
neon branches create depth-pass-backup-$(date +%Y%m%d-%H%M%S) --project-id <PROJECT_ID>

# Or via Neon Portal:
# 1. Navigate to Neon Dashboard
# 2. Select project
# 3. Go to Branches
# 4. Create new branch: "depth-pass-backup-YYYYMMDD-HHMMSS"
# 5. Document branch ID and timestamp
```

**Document Snapshot Details**:

- **Branch/Snapshot ID**: `[TO BE FILLED]`
- **Created At**: `[TO BE FILLED]`
- **Database URL**: `[TO BE FILLED]`
- **Purpose**: Pre-Depth-Pass schema state backup

---

## Migration Rehearsal Process

### Local Development

1. **Create migration**:
   ```bash
   cd apps/web
   pnpm prisma migrate dev --name "depth-pass-[migration-name]"
   ```

2. **Verify migration**:
   ```bash
   pnpm prisma generate
   pnpm typecheck
   pnpm lint
   ```

3. **Test locally**:
   ```bash
   pnpm dev
   # Run manual tests, verify schema changes
   ```

### Staging Deployment

1. **Deploy migration to staging**:
   ```bash
   # Set DATABASE_URL to staging
   export DATABASE_URL="[STAGING_DATABASE_URL]"
   pnpm prisma migrate deploy
   ```

2. **Run tests**:
   ```bash
   pnpm test
   pnpm test:e2e:smoke
   pnpm december:ready
   ```

3. **Verify staging**:
   - Check database schema matches expected
   - Verify no data loss
   - Test key flows manually

### Production Deployment

**ONLY AFTER STAGING VALIDATION**:

1. **Create production snapshot** (if not using branch):
   ```bash
   # Via Neon Portal or CLI
   # Create production backup before migration
   ```

2. **Deploy migration**:
   ```bash
   # Set DATABASE_URL to production
   export DATABASE_URL="[PRODUCTION_DATABASE_URL]"
   pnpm prisma migrate deploy
   ```

3. **Verify production**:
   - Monitor for errors
   - Check application logs
   - Verify key flows

---

## Rollback Procedures

### If Migration Fails

1. **Stop application** (if running)

2. **Restore from Neon branch**:
   ```bash
   # Via Neon Portal:
   # 1. Navigate to Branches
   # 2. Select backup branch
   # 3. Promote to main (or restore from snapshot)
   ```

3. **Or restore from snapshot**:
   ```bash
   # Via Neon Portal:
   # 1. Navigate to Project → Backups
   # 2. Select pre-migration snapshot
   # 3. Restore database
   ```

4. **Verify rollback**:
   ```bash
   pnpm prisma db pull
   # Verify schema matches pre-migration state
   ```

### If Data Issues Detected Post-Migration

1. **Assess impact**:
   - Identify affected records
   - Determine if data can be recovered

2. **Option A: Rollback** (if acceptable):
   - Follow rollback procedures above
   - Data loss acceptable

3. **Option B: Data Fix** (if rollback not acceptable):
   - Write data migration script
   - Fix affected records
   - Verify fixes

---

## Migration Checklist

Before each migration:

- [ ] Neon snapshot/branch created
- [ ] Snapshot details documented
- [ ] Migration tested locally
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Migration applied to staging
- [ ] Tests pass on staging
- [ ] Smoke tests pass on staging
- [ ] Manual verification on staging
- [ ] Production snapshot created (if needed)
- [ ] Migration applied to production
- [ ] Production verification complete

---

## Emergency Contacts

- **Database Admin**: [TO BE FILLED]
- **Neon Support**: [TO BE FILLED]
- **On-Call Engineer**: [TO BE FILLED]

---

## Migration History

| Date | Migration Name | Branch/Snapshot ID | Status | Notes |
|------|---------------|-------------------|--------|-------|
| TBD | depth-pass-crm-enhancements | TBD | Pending | - |
| TBD | depth-pass-pos-enhancements | TBD | Pending | - |
| TBD | depth-pass-tax-extensions | TBD | Pending | - |
| TBD | depth-pass-projects-wip | TBD | Pending | - |
| TBD | depth-pass-wms-extensions | TBD | Pending | - |
| TBD | depth-pass-manufacturing-extensions | TBD | Pending | - |
| TBD | depth-pass-metrics-star-schema | TBD | Pending | - |

---

**Last Updated**: 2025-01-18

