set -e

# 0) Where to run (adjust ONLY if your path differs)
ROOT="${PWD}"
echo "[0] CWD: $ROOT"

# 1) Verify required pages exist
REQ=(
  "website/home/index.html"
  "website/modules/index.html"
  "website/integrations/index.html"
  "website/security/index.html"
  "website/pricing/index.html"
  "website/resources/index.html"
  "website/about/index.html"
  "website/contact/index.html"
)
echo "[1] Verifying required pages"
for f in "${REQ[@]}"; do
  [[ -f "$f" ]] || { echo "❌ Missing: $f"; exit 1; }
done

# 2) Clean staging and create output structure
echo "[2] Preparing staging"
rm -rf build_hostinger_flat
mkdir -p build_hostinger_flat/{about,contact,integrations,modules,pricing,resources,security,assets}

# 3) Copy pages to flat structure (index at root)
echo "[3] Copying HTML pages"
cp -f website/home/index.html           build_hostinger_flat/index.html
cp -f website/modules/index.html        build_hostinger_flat/modules/index.html
cp -f website/integrations/index.html   build_hostinger_flat/integrations/index.html
cp -f website/security/index.html       build_hostinger_flat/security/index.html
cp -f website/pricing/index.html        build_hostinger_flat/pricing/index.html
cp -f website/resources/index.html      build_hostinger_flat/resources/index.html
cp -f website/about/index.html          build_hostinger_flat/about/index.html
cp -f website/contact/index.html        build_hostinger_flat/contact/index.html

# 4) Collect ALL images/icons into /assets (keeps original file names)
echo "[4] Collecting images/icons to /assets"
find website -type f \( -iname "*.png" -o -iname "*.svg" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.webp" \) \
  -exec bash -lc 'cp -f "$0" "build_hostinger_flat/assets/$(basename "$0")"' {} \;

# 5) Ensure /logo-nexa.png is at site root (source may be anywhere in website/*)
if [ -f build_hostinger_flat/assets/logo-nexa.png ]; then
  cp -f build_hostinger_flat/assets/logo-nexa.png build_hostinger_flat/logo-nexa.png
elif [ -f logo-nexa.png ]; then
  cp -f logo-nexa.png build_hostinger_flat/logo-nexa.png
fi
[[ -f build_hostinger_flat/logo-nexa.png ]] || { echo "❌ logo-nexa.png not found (place it in any website/* subfolder or project root)"; exit 1; }

# 6) Normalise links + images + logo across ALL pages (root-relative routes)
echo "[5] Normalising links, images, logo, footer"
normalize_html() {
  f="$1"
  # Routes
  sed -i '' \
    -e 's|href="\([^"]*\)home/index\.html"|href="/"|g' \
    -e 's|href="\([^"]*\)modules/index\.html"|href="/modules/"|g' \
    -e 's|href="\([^"]*\)integrations/index\.html"|href="/integrations/"|g' \
    -e 's|href="\([^"]*\)security/index\.html"|href="/security/"|g' \
    -e 's|href="\([^"]*\)pricing/index\.html"|href="/pricing/"|g' \
    -e 's|href="\([^"]*\)resources/index\.html"|href="/resources/"|g' \
    -e 's|href="\([^"]*\)about/index\.html"|href="/about/"|g' \
    -e 's|href="\([^"]*\)contact/index\.html"|href="/contact/"|g' \
    -e 's|href="#"|href="/"|g' \
    -e 's|javascript:void(0)|/|g' \
    -e 's|<a class="logo" href="[^"]*">|<a class="logo" href="/">|g' \
    "$f"

  # Images: push to /assets/ (except site root logo)
  perl -0777 -pe 's/src="(?:[^"]*\/)?([^"\/]+\.(?:png|svg|webp|jpe?g))"/"src=\"\/assets\/".$1."\""/ge' -i "$f"
  # Ensure the site logo points to the root copy
  sed -i '' -e 's|src="/assets/logo-nexa\.png"|src="/logo-nexa.png"|g' "$f"

  # Footer clean-ups: remove Status, phone numbers; improve description if placeholder text exists
  sed -i '' \
    -e 's|>Status</a>||g' \
    -e 's|<li>[^<]*Status[^<]*</li>||g' \
    -e 's|Phone:[^<]*||g' \
    -e 's|[+]44[ 0-9-]*||g' \
    -e 's|Enterprise planning with clear controls and a full audit trail\.|AI-powered finance, operations and manufacturing — with clear access controls, full audit history, and practical compliance. Contact: info@chiefaa.com|g' \
    "$f"
}
export -f normalize_html
find build_hostinger_flat -type f -name "*.html" -exec bash -c 'normalize_html "$0"' {} \;

# 7) Inject Pricing expand-on-click (CSS + JS, non-destructive)
echo "[6] Enhancing Pricing: expand cards on click"
perl -0777 -pe '
  s%</head>%<style id="nexa-pricing-expand">.card{cursor:pointer;overflow:hidden}.card .features{max-height:220px;overflow:hidden;transition:max-height .28s ease}.card.expanded .features{max-height:2000px}.card .hint{display:none}.card.expanded .hint{display:block}</style></head>%s
' -i build_hostinger_flat/pricing/index.html

perl -0777 -pe '
  s%</body>%<script id="nexa-pricing-expand-js">(function(){try{var cs=[].slice.call(document.querySelectorAll(".card"));cs.forEach(function(c){c.addEventListener("click",function(e){var t=e.target;if(t.closest("a,button,input,textarea,select"))return;c.classList.toggle("expanded")})})}catch(e){console&&console.warn&&console.warn("pricing expand",e)}})();</script></body>%s
' -i build_hostinger_flat/pricing/index.html

# 8) .htaccess and 404.html
echo "[7] Writing .htaccess + 404"
cat > build_hostinger_flat/.htaccess <<'HT'
# Nexa ERP — Hostinger static site
Options -Indexes
DirectoryIndex index.html

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} !=on
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# Mime types
AddType image/svg+xml .svg .svgz
AddType image/webp .webp
AddType application/json .json
AddType application/manifest+json .webmanifest
AddType font/woff2 .woff2
AddType font/woff .woff

# Cross-origin for fonts
<IfModule mod_headers.c>
  <FilesMatch "\.(ttf|ttc|otf|eot|woff|woff2|svg)$">
    Header set Access-Control-Allow-Origin "*"
  </FilesMatch>
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain text/html text/xml text/css text/javascript application/javascript application/x-javascript application/json image/svg+xml
</IfModule>

# Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresDefault "access plus 1h"
  ExpiresByType text/css "access plus 7 days"
  ExpiresByType application/javascript "access plus 7 days"
  ExpiresByType image/svg+xml "access plus 30 days"
  ExpiresByType image/webp "access plus 30 days"
  ExpiresByType image/png "access plus 30 days"
  ExpiresByType image/jpeg "access plus 30 days"
  ExpiresByType font/woff2 "access plus 30 days"
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>

ErrorDocument 404 /404.html
HT

cat > build_hostinger_flat/404.html <<'HTML'
<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found — Nexa ERP</title><style>:root{--blue:#2E6BFF;--navy:#0F2747;--bg:#F7F9FC;--border:#E6EAF2}html,body{margin:0;background:var(--bg);color:#0B1424;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}.wrap{min-height:100vh;display:grid;place-items:center;padding:32px}.card{background:#fff;border:1px solid var(--border);border-radius:14px;max-width:720px;width:100%;padding:28px;box-shadow:0 12px 28px rgba(46,107,255,.10)}.brand{display:flex;align-items:center;gap:10px;margin-bottom:10px}.brand img{height:28px}h1{margin:.2rem 0 0;color:var(--navy);font-size:28px}p{color:#334155;margin:10px 0 0}.actions{margin-top:16px;display:flex;gap:10px;flex-wrap:wrap}a.btn{border:1px solid var(--blue);background:var(--blue);color:#fff;text-decoration:none;border-radius:10px;padding:10px 14px;display:inline-block}a.link{color:#2E6BFF;text-decoration:none}</style></head><body><main class="wrap"><section class="card" aria-labelledby="title"><div class="brand"><img src="/logo-nexa.png" alt="Nexa logo"><strong>Nexa ERP</strong></div><h1 id="title">We could not find that page</h1><p>The address may be wrong or the page has moved. Use the buttons below to continue.</p><div class="actions"><a class="btn" href="/">Go to homepage</a><a class="link" href="/contact/">Contact us</a></div></section></main></body></html>
HTML

# 9) Final scrubs + dead link check
echo "[8] Final content scrub and dead-link check"
find build_hostinger_flat -type f -name "*.html" -print0 | xargs -0 sed -i '' \
  -e 's|/status||g' -e 's|Status page||g' -e 's|Phone:[^<]*||g' -e 's|[+]44[ 0-9-]*||g'
DEAD=$(grep -RIl --include="*.html" 'href="#"\|javascript:void(0)' build_hostinger_flat || true)
[ -z "$DEAD" ] || { echo "⚠️ Found dead links in:"; echo "$DEAD"; exit 1; }

# 10) Zip (always start fresh)
echo "[9] Packaging ZIP"
rm -f nexa-website-hostinger-*.zip
ZIPNAME="nexa-website-hostinger-$(date +%Y%m%d).zip"
( cd build_hostinger_flat && zip -rq "../$ZIPNAME" . )
ls -la "$ZIPNAME"
echo "✅ Upload this ZIP to Hostinger → public_html, then Extract."
echo "   Verify logo at /logo-nexa.png and images in /assets/."
