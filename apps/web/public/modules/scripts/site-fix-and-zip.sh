#!/usr/bin/env bash
set -euo pipefail
ROOT="apps/web/public/website"
[ -d "$ROOT" ]
echo "📁 Using website root: $ROOT"

# 1) Mobile CSS + link injection
mkdir -p "$ROOT/assets/css" "$ROOT/assets/js"
cat > "$ROOT/assets/css/mobile-overrides.css" << 'CSS'
/* Mobile header: logo top-left; tabs below in two neat rows; NO login button */
@media (max-width: 767.98px){
  .site-header{border-bottom:1px solid #e6eef8;margin:0;padding:0}
  .site-header .row-1,.site-header .row-2{display:block;max-width:1120px;margin:0 auto;padding:8px 16px}
  .site-header .row-1{padding-bottom:4px}
  .site-header .row-2{padding-top:0}
  .site-header .logo{display:inline-block;vertical-align:middle}
  .site-header .logo img{height:24px;width:auto}
  .primary-nav{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:6px}
  .primary-nav a{margin:0;font-size:14px;line-height:20px;padding:2px 4px;text-align:center}
  .secondary-nav,.btn-login,.login{display:none !important}
}
@media (max-width: 767.98px){
  .site-footer .footer-inner{display:flex;flex-direction:column;align-items:flex-start;gap:8px}
  .site-footer .footer-nav{display:flex;flex-wrap:wrap;gap:12px}
}
CSS
# Inject CSS link recursively (idempotent)
while IFS= read -r -d '' f; do
  if ! grep -q 'assets/css/mobile-overrides.css' "$f"; then
    perl -0777 -pe 's#</head>#  <link rel="stylesheet" href="/website/assets/css/mobile-overrides.css">\n</head>#' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
  fi
done < <(find "$ROOT" -type f -name "*.html" -print0)
echo "✅ CSS linked"

# 2) Homepage fix (nested fallback)
HP="$ROOT/index.html"; [ -f "$HP" ] || HP="$ROOT/homepage/homepage.html"; [ -f "$HP" ]
perl -0777 -pe 's#<(section|div)[^>]*>(?:(?:(?!</\1>).)*?(AI\s*built\s*in))(?:(?:(?!</\1>).)*?(UK[\x{2011}\- ]?ready))(?:(?:(?!</\1>).)*)</\1>##isg' "$HP" > "$HP.tmp" && mv "$HP.tmp" "$HP"
cat > "$ROOT/assets/js/hide-ai-ukready.js" << 'JS'
(function(){
  const tests=[/AI\s*built\s*in/i,/UK[\u2011\- ]?ready/i];
  const nodes=[...document.querySelectorAll('section,div,article,li')];
  for(const el of nodes){
    const t=(el.textContent||'').replace(/\s+/g,' ').trim();
    if(tests.every(rx=>rx.test(t))){ el.remove(); }
  }
})();
JS
if ! grep -q 'assets/js/hide-ai-ukready.js' "$HP"; then
  perl -0777 -pe 's#</head>#  <script defer src="/website/assets/js/hide-ai-ukready.js"></script>\n</head>#' "$HP" > "$HP.tmp" && mv "$HP.tmp" "$HP"
fi
echo "✅ Homepage AI/UK-ready targeted"

# 3) Resources FAQ update (nested fallback)
RES="$ROOT/resources.html"; [ -f "$RES" ] || RES="$ROOT/resources/resources.html"; [ -f "$RES" ]
perl -0777 -pe "s#(<[^>]*>(?:[^<]*how\\s*do\\s*i\\s*get\\s*help[^<]*</[^>]*>)[\\s\\S]*?<p[^>]*>)[\\s\\S]*?(</p>)#\\1Contact us through our contact page and we will respond back to you within 24 hours.\\2#is" "$RES" > "$RES.tmp" && mv "$RES.tmp" "$RES"
perl -pi -e "s/info@chiefaa\\.com/Contact us through our contact page and we will respond back to you within 24 hours./gi" "$RES"
if ! grep -qi "Contact us through our contact page and we will respond back to you within 24 hours." "$RES"; then
  perl -0777 -pe "s#(>\\s*how\\s*do\\s*i\\s*get\\s*help\\s*</[^>]+>)#\\1\n<p>Contact us through our contact page and we will respond back to you within 24 hours.</p>#i" "$RES" > "$RES.tmp" && mv "$RES.tmp" "$RES"
fi
echo "✅ Resources updated"

# 4) About email removal (nested fallback)
ABOUT="$ROOT/about.html"; [ -f "$ABOUT" ] || ABOUT="$ROOT/about/about.html"; [ -f "$ABOUT" ]
perl -0777 -pe 's#.*Contact\\s*Email:\\s*info@chiefaa\\.com.*\\n##gi' "$ABOUT" > "$ABOUT.tmp" && mv "$ABOUT.tmp" "$ABOUT"
perl -0777 -pe 's#<[^>]*>\\s*Contact\\s*Email:\\s*info@chiefaa\\.com\\s*</[^>]*>##gi' "$ABOUT" > "$ABOUT.tmp" && mv "$ABOUT.tmp" "$ABOUT"
! grep -qi "info@chiefaa.com" "$ABOUT" || { echo "❌ Email still present on About"; exit 1; }
echo "✅ About email removed"

# 5) Contact email removal (nested fallback)
CONTACT="$ROOT/contact.html"; [ -f "$CONTACT" ] || CONTACT="$ROOT/contact/contact.html"; [ -f "$CONTACT" ]
perl -0777 -pe 's#.*Contact\\s*details\\s*Email:\\s*info@chiefaa\\.com.*\\n##gi' "$CONTACT" > "$CONTACT.tmp" && mv "$CONTACT.tmp" "$CONTACT"
perl -0777 -pe 's#<[^>]*>\\s*Contact\\s*details\\s*Email:\\s*info@chiefaa\\.com\\s*</[^>]*>##gi' "$CONTACT" > "$CONTACT.tmp" && mv "$CONTACT.tmp" "$CONTACT"
! grep -qi "info@chiefaa.com" "$CONTACT" || { echo "❌ Email still present on Contact"; exit 1; }
echo "✅ Contact email removed"

# 6) Sanity sweep
! grep -Rqi "info@chiefaa.com" "$ROOT" || { echo "❌ Some chiefaa emails still present"; grep -Rni "info@chiefaa.com" "$ROOT" || true; exit 1; }
echo "✅ No chiefaa emails remain"

# 7) Build ZIP & prune old
mkdir -p ops/site-backups scripts/hostinger
if [ ! -f scripts/hostinger/package.mjs ]; then
  cat > scripts/hostinger/package.mjs <<'PKG'
import {execSync} from 'child_process'; import fs from 'fs'; import path from 'path';
const outDir='ops/site-backups'; fs.mkdirSync(outDir,{recursive:true});
const stamp=new Date().toISOString().slice(0,10).replace(/-/g,''); const zip=path.join(outDir,`nexa-website-hostinger-${stamp}.zip`);
execSync(`cd apps/web/public && zip -r "../../..//${zip}" . -x "**/.DS_Store"` , {stdio:'inherit'}); console.log('ZIP_BUILT:',zip);
PKG
fi
node scripts/hostinger/package.mjs | tee /tmp/zip.log
NEW_ZIP=$(grep -oE "ops/site-backups/nexa-website-hostinger-[0-9]{8}\\.zip" /tmp/zip.log | tail -n1)
[ -f "$NEW_ZIP" ] || { echo "❌ ZIP not created"; exit 1; }
for z in $(ls -1t ops/site-backups/nexa-website-hostinger-*.zip 2>/dev/null | tail -n +2); do rm -f "$z"; done

echo "🎁 New ZIP ready: $NEW_ZIP"
echo "🗑️  Old ZIPs deleted (kept newest only)"
