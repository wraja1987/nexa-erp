#!/usr/bin/env bash
set -euo pipefail
set +H

CLEAN="$HOME/Desktop/Nexa ERP CLEAN PUSH"
cd "$CLEAN"

BRANCH="chore/website-pricing-to-contact-quote-$(date +%Y%m%d-%H%M%S)"
git fetch -q || true
git switch -c "$BRANCH" || git switch "$BRANCH"

# Build file list (HTML/MD/JSON/TS/JS) containing price-like strings
rg -l -S --no-ignore-vcs -g '!**/node_modules/**' \
  -e '£\s*\d[\d,]*(\.\d+)?' -e '\\b/month\\b' -e '\\bper\\s+month\\b' \
  apps/web/public/Extras/website apps/web/public/build_hostinger apps/web/public/build_hostinger_v* apps/web/public \
  > /tmp/website_cta_files.txt || true

# HTML/MD/MDX: replace price blocks and dangling text with CTA
while IFS= read -r f; do
  [[ -f "$f" ]] || continue
  case "$f" in
    *.html|*.htm|*.md|*.mdx)
      perl -0777 -i -pe 's@<h[1-6][^>]*>\s*£\s*\d[\d,]*(\.\d+)?\s*(?:/\s*month|per\s*month)?\s*</h[1-6]>@<a href="/contact" class="cta-quote" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#4F46E5;color:#fff;text-decoration:none;font-weight:600;line-height:1.2;">Contact us for a quote</a>@gis' "$f"
      perl -0777 -i -pe 's@<(p|div|span)[^>]*>(?:(?:(?!</\1>).)*?)£\s*\d[\d,]*(\.\d+)?(?:(?:(?!</\1>).)*?)</\1>@<a href="/contact" class="cta-quote" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#4F46E5;color:#fff;text-decoration:none;font-weight:600;line-height:1.2;">Contact us for a quote</a>@gis' "$f"
      perl -0777 -i -pe 's@\s*/\s*month\b@@gi' "$f"
      perl -0777 -i -pe 's@\bper\s+month\b@@gi' "$f"
      perl -0777 -i -pe 's@Plans?\s+start\s+from\s+£[\d,\.]+\s*(?:/\s*month|per\s*month)?@Contact us for a quote@gis' "$f"
      perl -0777 -i -pe 's@(<([a-zA-Z0-9:_-]+)[^>]*class="[^"]*(price|plan-price)[^"]*"[^>]*>)\s*(</\2>)@\1<a href="/contact" class="cta-quote" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#4F46E5;color:#fff;text-decoration:none;font-weight:600;line-height:1.2;">Contact us for a quote</a>\4@gis' "$f"
      ;;
  esac
done < /tmp/website_cta_files.txt

# JSON: neutralize price fields and raw currency
while IFS= read -r f; do
  [[ -f "$f" ]] || continue
  case "$f" in
    *.json)
      perl -0777 -i -pe 's/"price(Text|Label)?"\s*:\s*"[^"]*"/"price\1":"Contact us for a quote"/gi' "$f"
      perl -0777 -i -pe 's/"price"\s*:\s*\d[\d,\.\s]*/"price":null/gi' "$f"
      perl -0777 -i -pe 's/£\s*\d[\d,]*(\.\d+)?/"Contact us for a quote"/gi' "$f"
      ;;
  esac
done < /tmp/website_cta_files.txt

# TS/JS fallback: price fields to CTA text
while IFS= read -r f; do
  [[ -f "$f" ]] || continue
  case "$f" in
    *.ts|*.tsx|*.js)
      perl -0777 -i -pe 's/\bprice(Text|Label)?\s*:\s*["\'\']?£?\d[\d,\.]*["\'\']?/price\1: "Contact us for a quote"/gi' "$f"
      ;;
  esac
done < /tmp/website_cta_files.txt

# Post-scan
rg -n -S --no-ignore-vcs -g '!**/node_modules/**' \
  -e '£\s*\d[\d,]*(\.\d+)?' -e '\\b/month\\b' -e '\\bper\\s+month\\b' \
  apps/web/public/Extras/website apps/web/public/build_hostinger apps/web/public/build_hostinger_v* apps/web/public || true

# Commit and push
git add -A
git commit -m "website(pricing): replace prices with 'Contact us for a quote' CTA; neutralise static stubs" || true
git -c pack.window=0 -c pack.threads=1 -c pack.writeBitmaps=false push -u origin "$BRANCH"

# Build ZIP
mkdir -p dist
STAMP="$(date +%Y%m%d-%H%M%S)"
ZIP="dist/nexa-website-pricing-contact-cta-$STAMP.zip"
zip -qr "$ZIP" apps/web/public -x '*/node_modules/*' '*/.DS_Store' '*/.next/*' '*/dist/*' '*/build/*' || true
echo "ZIP ready: $ZIP"


