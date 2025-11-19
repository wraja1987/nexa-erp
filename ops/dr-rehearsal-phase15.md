Last updated: 2025-11-16

Purpose
- Step-by-step guide for performing a DR (Disaster Recovery) rehearsal on a non-production Neon branch.
- Ensures DR procedures are tested and documented without touching production.

Who should read this
- SREs, DevOps engineers, release managers performing DR drills.

---

## Prerequisites

- Access to Neon console (or Neon CLI)
- Access to staging Vercel project (or ability to set environment variables)
- Non-production database URL for DR environment
- `pnpm` and Node.js 20 installed locally

---

## DR Rehearsal Steps

### Step 1: Create Neon Branch/Snapshot from Production

**Option A: Via Neon Console**
1. Log into Neon console: https://console.neon.tech
2. Select your production project
3. Navigate to "Branches" section
4. Click "Create Branch" or "Create Snapshot"
5. Name it: `dr-rehearsal-YYYYMMDD-HHMMSS` (e.g., `dr-rehearsal-20251116-140000`)
6. Copy the branch connection string (will be different from production)

**Option B: Via Neon CLI** (if installed)
```bash
# Set Neon API token (if not already set)
export NEON_API_KEY="your-neon-api-key"

# Create branch from production
neon branches create --project-id <your-project-id> --name dr-rehearsal-$(date +%Y%m%d-%H%M%S)
```

**Important**: This step creates a read-only snapshot/branch. No data is modified in production.

### Step 2: Set Up DR Database Connection

1. Copy the connection string from the Neon branch created in Step 1
2. Set it as an environment variable:
   ```bash
   export DR_DATABASE_URL="postgresql://user:password@ep-xxx-xxx.region.neon.tech/dbname?sslmode=require"
   ```

### Step 3: Point Staging Deployment at DR Database

**Option A: Via Vercel Dashboard**
1. Go to Vercel dashboard: https://vercel.com
2. Select your staging project
3. Go to Settings → Environment Variables
4. Temporarily update `DATABASE_URL` to point to the DR branch connection string
5. Redeploy staging (or wait for next deployment)

**Option B: Via Local Environment**
1. Create `.env.dr` file:
   ```bash
   DATABASE_URL="${DR_DATABASE_URL}"
   # Copy other required env vars from staging
   ```
2. Use this file when running local checks

**Important**: Do NOT update production environment variables. Only staging or local test environments.

### Step 4: Run Build and Type Checks

```bash
# Ensure you're using the DR database URL
export DATABASE_URL="${DR_DATABASE_URL}"

# Run typecheck
pnpm -w typecheck

# Run build
pnpm -w build
```

Expected: Both should pass without errors.

### Step 5: Run Runtime Smoke Tests

```bash
# Set staging/base URL (adjust to your staging URL)
export RUNTIME_SMOKE_BASE_URL="https://staging.nexaai.co.uk"

# Run runtime smoke script
tsx scripts/runtime/runtime-smoke.ts
```

Expected: All smoke tests should pass (or return expected 401/403 for unauthenticated endpoints).

### Step 6: Validate Key Flows

Manually test (or use Playwright) the following flows:

1. **Login Flow**
   - Navigate to `/login`
   - Log in with test credentials
   - Verify redirect to `/dashboard`

2. **Finance Reports**
   - Navigate to `/finance/reports`
   - Verify P&L, Balance Sheet, Trial Balance load
   - Check receivables/payables ageing reports

3. **Inventory Views**
   - Navigate to `/inventory/stock`
   - Verify stock summary loads
   - Check inventory items list

4. **HR Payroll**
   - Navigate to `/hr/payroll`
   - Verify payroll runs list loads
   - Check payslips view

5. **Banking Screens**
   - Navigate to `/banking/accounts`
   - Verify accounts list loads
   - Check reconciliation view

6. **Healthcare**
   - Navigate to `/healthcare/reports`
   - Verify overview loads (may show schema-gap messages, which is expected)

7. **AI Overview**
   - Navigate to `/ai/overview`
   - Verify AI management commentary loads

### Step 7: Document Results

1. Create a new report using the template:
   ```bash
   cp reports/dr-test-template-PHASE15.md reports/dr-test-$(date +%Y%m%d-%H%M%S).md
   ```

2. Fill in:
   - Date of rehearsal
   - Neon branch name used
   - Environment URL tested
   - Results of each step (pass/fail)
   - Any issues encountered
   - Sign-off from SRE/release manager

### Step 8: Cleanup

1. **Revert Staging Environment Variables** (if changed)
   - Restore original `DATABASE_URL` in Vercel staging project
   - Redeploy if necessary

2. **Delete Neon Branch** (optional, after report is finalized)
   - Via Neon Console: Delete the DR rehearsal branch
   - Or keep it for a retention period (e.g., 30 days) for reference

---

## Success Criteria

- ✅ All build/typecheck steps pass
- ✅ Runtime smoke tests pass (or return expected auth errors)
- ✅ All key flows validated manually or via Playwright
- ✅ DR test report completed and signed off
- ✅ No production data modified
- ✅ Staging environment restored to original state

---

## Troubleshooting

**Issue**: Build fails with database connection errors
- **Solution**: Verify `DR_DATABASE_URL` is correct and accessible. Check Neon branch status.

**Issue**: Smoke tests fail with 500 errors
- **Solution**: Check application logs. May indicate missing environment variables or configuration issues.

**Issue**: Key flows fail to load
- **Solution**: Verify all required environment variables are set in staging. Check browser console for errors.

---

## Frequency

- **Recommended**: Quarterly (every 3 months)
- **Minimum**: Annually (once per year)
- **After major schema changes**: Within 1 week of migration

---

## Notes

- This DR rehearsal is **non-destructive**. No data is modified in production.
- The DR branch is a snapshot/read-only copy of production data at the time of branch creation.
- All testing should be done against staging or local environments, never production.
- If issues are found during DR rehearsal, document them and create follow-up tasks to address them.

