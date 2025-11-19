#!/usr/bin/env bash
set -euo pipefail

# DR Rehearsal Helper Script
# This script guides you through DR rehearsal steps but does NOT perform destructive operations.
# It echoes instructions and optionally runs non-destructive checks.

echo "🔄 Nexa ERP DR Rehearsal Helper"
echo "================================="
echo ""
echo "This script guides you through DR rehearsal steps."
echo "It does NOT perform destructive operations or connect to production directly."
echo ""

# Check if DR_DATABASE_URL is set
if [ -z "${DR_DATABASE_URL:-}" ]; then
  echo "⚠️  DR_DATABASE_URL environment variable is not set."
  echo ""
  echo "To proceed, you need to:"
  echo "1. Create a Neon branch/snapshot from production (via Neon Console)"
  echo "2. Copy the connection string"
  echo "3. Set it as: export DR_DATABASE_URL='postgresql://...'"
  echo ""
  echo "See ops/dr-rehearsal-phase15.md for detailed steps."
  exit 1
fi

# Check if DATABASE_URL points to production (simple check)
if [[ "${DR_DATABASE_URL}" == *"production"* ]] || [[ "${DR_DATABASE_URL}" == *"prod"* ]]; then
  echo "⚠️  WARNING: DR_DATABASE_URL appears to point to production!"
  echo "   This script should only use non-production databases."
  echo "   Aborting for safety."
  exit 1
fi

echo "✅ DR_DATABASE_URL is set (non-production check passed)"
echo ""

# Check if RUNTIME_SMOKE_BASE_URL is set
RUNTIME_URL="${RUNTIME_SMOKE_BASE_URL:-}"
if [ -z "$RUNTIME_URL" ]; then
  echo "⚠️  RUNTIME_SMOKE_BASE_URL is not set."
  echo "   Runtime smoke tests will be skipped."
  echo "   Set it to your staging URL to run smoke tests:"
  echo "   export RUNTIME_SMOKE_BASE_URL='https://staging.nexaai.co.uk'"
  echo ""
  SKIP_SMOKE=true
else
  SKIP_SMOKE=false
  echo "✅ RUNTIME_SMOKE_BASE_URL is set: $RUNTIME_URL"
  echo ""
fi

echo "📋 DR Rehearsal Steps:"
echo "======================"
echo ""
echo "Step 1: ✅ Neon branch created (manual step via Neon Console)"
echo "Step 2: ✅ DR_DATABASE_URL set"
echo "Step 3: ⚠️  Point staging deployment at DR database (manual step via Vercel)"
echo ""

# Step 4: Run build and typecheck
echo "Step 4: Running typecheck and build..."
echo "--------------------------------------"
export DATABASE_URL="$DR_DATABASE_URL"

if pnpm -w typecheck; then
  echo "✅ Typecheck passed"
else
  echo "❌ Typecheck failed"
  exit 1
fi

if DATABASE_URL="$DR_DATABASE_URL" pnpm -w build; then
  echo "✅ Build passed"
else
  echo "❌ Build failed"
  exit 1
fi

echo ""

# Step 5: Run runtime smoke tests (if URL is set)
if [ "$SKIP_SMOKE" = false ]; then
  echo "Step 5: Running runtime smoke tests..."
  echo "--------------------------------------"
  if command -v tsx >/dev/null 2>&1; then
    if tsx scripts/runtime/runtime-smoke.ts; then
      echo "✅ Runtime smoke tests passed"
    else
      echo "❌ Runtime smoke tests failed (check output above)"
      exit 1
    fi
  else
    echo "⚠️  tsx not found. Install it with: pnpm add -D tsx"
    echo "   Skipping runtime smoke tests."
  fi
else
  echo "Step 5: ⏭️  Skipping runtime smoke tests (RUNTIME_SMOKE_BASE_URL not set)"
fi

echo ""
echo "Step 6: ⚠️  Validate key flows manually (see ops/dr-rehearsal-phase15.md)"
echo "Step 7: ⚠️  Document results in reports/dr-test-template-PHASE15.md"
echo "Step 8: ⚠️  Cleanup (revert staging env vars, delete Neon branch if desired)"
echo ""
echo "✅ DR Rehearsal helper script completed successfully!"
echo ""
echo "Next steps:"
echo "1. Manually validate key flows (login, finance reports, inventory, HR, banking, healthcare, AI)"
echo "2. Document results in reports/dr-test-template-PHASE15.md"
echo "3. Clean up staging environment variables"
echo "4. Optionally delete Neon branch after report is finalized"
echo ""

