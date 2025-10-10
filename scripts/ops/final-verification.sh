#!/usr/bin/env bash
set -euo pipefail

# ---------- CONFIG ----------
: "${PROD_URL:?Set PROD_URL (e.g., https://nexaai.co.uk)}"
OWNER_REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
REPO="${OWNER_REPO##*/}"
OWNER="${OWNER_REPO%%/*}"
WORK_DIR="$(pwd)"
OUT=".reports/final-verification"
mkdir -p "$OUT"

echo "Repo: $OWNER_REPO"
echo "Prod: $PROD_URL"
echo "Out : $OUT"

# ---------- 0) Detect PR (if any) ----------
# Prefer the most recent open PR
PR_NUMBER="$(gh pr list --state open --json number,createdAt -q "sort_by(.createdAt)|reverse|.[0].number" || true)"
echo "PR_NUMBER=${PR_NUMBER:-<none>}"

# ---------- 1) VERCEL: verify preview & DNS ----------
if command -v vercel >/dev/null 2>&1 && [ -n "${VERCEL_TOKEN:-}" ]; then
  echo "🔎 Vercel: Inspecting deployments and domain/DNS"
  # Detect Vercel project name by reading vercel.json or fallback to repo name
  VERCEL_PROJECT="$(jq -r ".name // empty" vercel.json 2>/dev/null || true)"
  if [ -z "$VERCEL_PROJECT" ] || [ "$VERCEL_PROJECT" = "null" ]; then VERCEL_PROJECT="$REPO"; fi
  echo "Vercel project: $VERCEL_PROJECT"

  # Latest deployment (any env)
  vercel --token "$VERCEL_TOKEN" ls "$VERCEL_PROJECT" --confirm --json | jq '.[0]' > "$OUT/vercel_latest.json" || true

  # Check domain DNS/cert
  vercel --token "$VERCEL_TOKEN" domains inspect "${PROD_URL#https://}" --json > "$OUT/vercel_domain_inspect.json" || true

  echo "✅ Saved: $OUT/vercel_latest.json & $OUT/vercel_domain_inspect.json"
else
  echo "⚠️  Skipping Vercel CLI (missing vercel or VERCEL_TOKEN)"
fi

# ---------- 2) Lighthouse against PROD ----------
echo "⚡ Running Lighthouse (npx @lhci/cli) against $PROD_URL ..."
mkdir -p "$OUT/lhci"
npx --yes @lhci/cli@0.14.0 collect \
  --url "$PROD_URL" \
  --numberOfRuns=1 \
  --outputPath="$OUT/lhci" \
  --settings.preset=desktop \
  --settings.maxWaitForLoad=120000 \
  --settings.chromeFlags="--headless=new --no-sandbox --disable-dev-shm-usage" >/dev/null || true

if [ ! -f "$OUT/lhci/lhr-0.json" ]; then
  sleep 5
  npx --yes @lhci/cli@0.14.0 collect \
    --url "$PROD_URL" \
    --numberOfRuns=1 \
    --outputPath="$OUT/lhci" \
    --settings.preset=desktop \
    --settings.maxWaitForLoad=120000 \
    --settings.chromeFlags="--headless=new --no-sandbox --disable-dev-shm-usage" >/dev/null || true
fi

# Generate HTML report if JSON present
if [ -f "$OUT/lhci/lhr-0.json" ]; then
  npx --yes @lhci/cli@0.14.0 upload --target=filesystem --outputDir="$OUT/lhci" >/dev/null || true
  echo "✅ Lighthouse reports saved under $OUT/lhci"
else
  echo "❌ Lighthouse result JSON missing; check network/DNS."
fi

# ---------- 3) Screenshot + headers of /login ----------
echo "📸 Capturing /login screenshot + headers with Playwright..."
node --input-type=module - << "JS"
import { chromium } from "playwright";
import fs from "fs";
const prod = process.env.PROD_URL;
const outDir = process.env.OUT || ".reports/final-verification";
(async ()=>{
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const resp = await page.goto(prod.replace(/\/$/, "") + "/login", { waitUntil: "networkidle" });
  await page.screenshot({ path: outDir + "/login.png", fullPage: true });
  // Use headers() for compatibility across Playwright versions
  const hdr = resp ? resp.headers() : {};
  fs.writeFileSync(outDir + "/login.headers.json", JSON.stringify(hdr, null, 2));
  await browser.close();
  console.log("Saved screenshot & headers to", outDir);
})().catch(e=>{ console.error(e); process.exit(1); });
JS
echo "✅ Saved: $OUT/login.png and $OUT/login.headers.json"

# ---------- 4) Curl raw headers of PROD root ----------
echo "📝 Fetching raw HEAD headers for $PROD_URL ..."
curl -s -D "$OUT/root.headers.txt" -o /dev/null "$PROD_URL" || true
echo "✅ Saved: $OUT/root.headers.txt"

# ---------- 5) Summarize results ----------
SUMMARY="$OUT/summary.md"
cat > "$SUMMARY" << EOF
# Final Verification Summary

**Repo:** $OWNER_REPO  
**Prod:** $PROD_URL

## Vercel
- Latest deployment: \`$OUT/vercel_latest.json\` (if present)
- Domain inspect (DNS/SSL): \`$OUT/vercel_domain_inspect.json\` (if present)

## Lighthouse (prod)
- Reports: \`$OUT/lhci\` (JSON + HTML)
  - If HTML was generated: \`$OUT/lhci/lhr-0.report.html\`

## Login Page (prod)
- Screenshot: \`$OUT/login.png\`
- Response headers: \`$OUT/login.headers.json\`

## Root (prod) Headers
- Raw headers: \`$OUT/root.headers.txt\`

EOF
echo "✅ Wrote $SUMMARY"

# ---------- 6) Upload artifacts to the current run (if inside CI) ----------
if [ -n "${GITHUB_RUN_ID:-}" ]; then
  echo "⬆️  Uploading artifacts from CI"
  mkdir -p "$OUT"
  tar -C "$OUT" -czf "$WORK_DIR/final-verification.tgz" .
  echo "::group::Upload artifacts"
  echo "Artifact path: $WORK_DIR/final-verification.tgz"
  echo "::endgroup::"
fi

# ---------- 7) Comment results on PR (if any) ----------
if [ -n "${PR_NUMBER:-}" ]; then
  echo "💬 Commenting summary on PR #$PR_NUMBER"
  gh pr comment "$PR_NUMBER" --body-file "$SUMMARY" || true
else
  echo "ℹ️ No open PR detected; skipping PR comment."
fi

# ---------- 8) Lock required checks on main (best-effort; needs admin scope) ----------
echo "🔐 Attempting to set required checks for main ..."
# Include the GitHub Actions workflow + any custom checks you want to enforce:
REQ_CHECKS=(
  "Verify & Self-Heal (Playwright)"
)
# Add more if you have named checks like "Image audit" or "Lighthouse"
# REQ_CHECKS+=("Image audit")
# REQ_CHECKS+=("Lighthouse")

JSON_REQ=$(printf "%s\n" "${REQ_CHECKS[@]}" | jq -R . | jq -s .)

gh api -X PUT "repos/$OWNER_REPO/branches/main/protection" \
  -H "Accept: application/vnd.github+json" \
  -f required_status_checks.strict=true \
  --raw-field "required_status_checks.contexts=${JSON_REQ}" \
  -f required_pull_request_reviews.required_approving_review_count=1 \
  -f enforce_admins=true \
  -f restrictions= \
  >/dev/null 2>&1 || echo "⚠️  Failed to set branch protection (need admin scope)."

echo
echo "✅ DONE"
echo "Artifacts directory: $OUT"


