#!/bin/zsh -l
set -euo pipefail

# ====== INPUT FILES YOU GAVE ME ======
SRC_ZIP="$HOME/Desktop/nexa-website-hostinger-HEADER-ALIGN-FINAL-20250921-102513.zip"

REF_MOBILE_IMG="/Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/apps/web/public/website/nexa_mobile_header_mockup.png"
REF_DESKTOP_IMG="/Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/apps/web/public/website/laptop-viewing-header-tab-format.png"
REF_FOOTER_IMG="/Users/waheedraja/Desktop/Business Opportunities/Nexa ERP/apps/web/public/website/footer-tab-nexa.png"

# ====== WORKDIR / OUTPUT ======
TS="$(date +%Y%m%d-%H%M%S)"
WORKDIR="$HOME/Desktop/_nexa_apply_headers_$TS"
OUT_ZIP="$HOME/Desktop/nexa-website-hostinger-APPLIED-HEADERS-$TS.zip"

echo "→ Preparing workspace: $WORKDIR"
mkdir -p "$WORKDIR/site"
cp "$SRC_ZIP" "$WORKDIR/source-backup.zip"

echo "→ Unzipping source…"
unzip -q "$SRC_ZIP" -d "$WORKDIR/site"

SITE_ROOT="$WORKDIR/site"
# If the ZIP contained a single top-level folder, descend into it
if [ "$(find "$SITE_ROOT" -maxdepth 1 -mindepth 1 -type d | wc -l | tr -d ' ')" -eq 1 ] && [ ! -f "$SITE_ROOT/index.html" ]; then
  SITE_ROOT="$(find "$SITE_ROOT" -maxdepth 1 -mindepth 1 -type d | head -n1)"
fi

echo "→ Site root: $SITE_ROOT"

# ====== Reference images archived into the build (not used by the site UI) ======
mkdir -p "$SITE_ROOT/website/reference"
for IMG in "$REF_MOBILE_IMG" "$REF_DESKTOP_IMG" "$REF_FOOTER_IMG"; do
  if [ -f "$IMG" ]; then
    cp "$IMG" "$SITE_ROOT/website/reference/" || true
  fi
done

# ====== Create / update the shared CSS that enforces layout (desktop + mobile) ======
mkdir -p "$SITE_ROOT/website/system"
CSS_PATH="$SITE_ROOT/website/system/nexa-header-footer.css"

cat > "$CSS_PATH" <<'CSS'
/* === Nexa Header/Footer Normaliser – DO NOT REMOVE === */

/* Reset & base */
html, body { margin: 0; padding: 0; }

/* Desktop header must be the exact, single-row bar (brand | nav | login) */
header.header {
  background: #fff;
  border-bottom: 1px solid rgba(15,39,71,0.06);
  position: sticky; top: 0; z-index: 1200;
  padding: 12px 24px;
  box-sizing: border-box;
}
header.header .container {
  max-width: 1200px; margin: 0 auto;
  display: grid !important;
  grid-template-columns: auto 1fr auto; /* brand | nav | login */
  align-items: center !important;
  column-gap: 32px;
}
header.header .brand { display: inline-flex; align-items: center; gap: 10px; white-space: nowrap; }
header.header .brand img, header.header .brand svg { display:block; height: 28px; width:auto; }

header.header nav {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 28px !important;
  flex-wrap: nowrap !important;
  min-width: 0;
}
header.header nav a { text-decoration: none; display: inline-flex; align-items: center; padding: 4px 0; }

header.header .actions, header.header .login, header.header .cta {
  display: inline-flex !important; align-items: center !important;
  margin-left: auto;
}
header.header .actions .btn, header.header .login .btn, header.header .cta .btn,
header.header .actions a,   header.header .login a,   header.header .cta a {
  display:inline-flex; align-items:center; padding:8px 14px;
  border:1px solid rgba(15,39,71,0.15); border-radius:12px;
}
/* Ensure breathing room below the sticky header */
header.header + * { margin-top: clamp(16px, 3.5vw, 40px) !important; }

/* --- Tablet/Mobile (≤1024px): follow mockup, nav wraps neatly under brand --- */
@media (max-width: 1024px) {
  header.header { padding: 10px 16px; }
  header.header .container { column-gap: 16px; grid-template-columns: 1fr auto; grid-auto-rows: auto; }
  header.header .brand   { grid-column: 1 / span 1; grid-row: 1; }
  header.header .login, 
  header.header .actions, 
  header.header .cta     { grid-column: 2; grid-row: 1; justify-content: end; }
  header.header nav      { grid-column: 1 / span 2; grid-row: 2; width: 100%; }
}

/* --- Small Mobile (≤640px): two-column grid of links, as per your mockup --- */
@media (max-width: 640px) {
  header.header { padding: 10px 12px; }
  header.header .brand img, header.header .brand svg { height: 24px; }
  header.header nav {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0,1fr));
    gap: 12px 18px !important;
    justify-content: start !important;
    align-items: center !important;
    width: 100% !important;
    padding-top: 8px;
  }
  header.header .actions .btn, header.header .login .btn, header.header .cta .btn { padding: 8px 12px; }
}

/* Consistent breathing room after header so page titles never crash into it */
main > :first-child { margin-top: clamp(16px, 3.5vw, 40px) !important; }

/* Footer – enforce a single approved layout everywhere (mobile-first) */
footer.nexa { display:block !important; padding: 24px 16px; background:#fff; border-top:1px solid rgba(15,39,71,0.06); }
footer.nexa .cols { display:grid; gap:16px; grid-template-columns:1fr; max-width:1200px; margin:0 auto; }
@media (min-width:640px){ footer.nexa .cols { grid-template-columns: repeat(2,1fr); } }
@media (min-width:1024px){ footer.nexa .cols { grid-template-columns: repeat(4,1fr); } }

/* Normalise main content container width to match across pages */
main .container, .page .container, .content .container {
  max-width: 1200px; margin: 0 auto; padding-left: 24px; padding-right: 24px; box-sizing: border-box;
}
CSS

# ====== Helpers (Perl-based) ======
inject_head_bits() {
  local file="$1"
  # Ensure viewport meta
  if ! grep -qi 'name="viewport"' "$file"; then
    perl -0777 -pe 's#</head>#  <meta name="viewport" content="width=device-width, initial-scale=1" />\n</head>#i' -i "$file"
  fi
  # Ensure stylesheet link (cache-busted)
  if ! grep -qi 'nexa-header-footer.css' "$file"; then
    perl -0777 -pe 's#</head>#  <link rel="stylesheet" href="/website/system/nexa-header-footer.css?v=10" />\n</head>#i' -i "$file"
  fi
}

strip_anything_before_header() {
  local file="$1"
  # Remove anything between <body> and the first canonical <header class="header">
  perl -0777 -pe 's#(<body\b[^>]*>).*?(<header[^>]*class="[^"]*\bheader\b[^"]*"[^>]*>)#${1}${2}#is' -i "$file"
}

# ====== 1) Capture canonical HEADER and FOOTER from index.html ======
INDEX_HTML="$SITE_ROOT/index.html"
if [ ! -f "$INDEX_HTML" ]; then
  echo "✗ index.html not found at site root."; exit 1
fi

CANON_HEADER="$(perl -0777 -ne 'print $1 if /(<header[^>]*class="[^"]*\bheader\b[^"]*"[^>]*>.*?<\/header>)/is' "$INDEX_HTML")"
if [ -z "$CANON_HEADER" ]; then echo "✗ Could not read canonical header from index.html"; exit 1; fi
# Normalize Home link in canonical header to /homepage/
CANON_HEADER="$(printf "%s" "$CANON_HEADER" | perl -0777 -pe 's#(<a\b[^>]*href=\")(?:/|\./|/index\.html|index\.html)(\"[^>]*>\s*(?:Home|Homepage)\s*<)#$1/homepage/$2#is')"

# Prefer <footer class="nexa"> else any <footer>
CANON_FOOTER="$(perl -0777 -ne 'print $1 if /(<footer[^>]*class="[^"]*nexa[^"]*"[^>]*>.*?<\/footer>)/is' "$INDEX_HTML")"
if [ -z "$CANON_FOOTER" ]; then
  CANON_FOOTER="$(perl -0777 -ne 'print $1 if /(<footer\b[^>]*>.*?<\/footer>)/is' "$INDEX_HTML")"
fi
if [ -z "$CANON_FOOTER" ]; then echo "✗ Could not read canonical footer from index.html"; exit 1; fi

# Export so Perl sees them via %ENV
export CANON_HEADER
export CANON_FOOTER

# ====== 2) Replace header/footer on ALL pages ======
echo "→ Patching header/footer on all .html pages"
find "$SITE_ROOT" -type f -name "*.html" -print0 | while IFS= read -r -d '' FILE; do
  rel="${FILE#$SITE_ROOT/}"
  echo "→ Patching: $rel"
  # Remove any existing header/footer blocks (broad)
  perl -0777 -pe 'BEGIN{$/=undef;} s#<header\b[^>]*>.*?</header>##is; s#<footer\b[^>]*>.*?</footer>##is' -i "$FILE"
  # Insert canonical header at top of <body> (or at start if no <body>)
  if grep -qi '<body' "$FILE"; then
    perl -0777 -pe 's#(<body\b[^>]*>)#${1}\n$ENV{CANON_HEADER}#i' -i "$FILE"
  else
    perl -0777 -pe '$_ = "$ENV{CANON_HEADER}\n" . $_' -i "$FILE"
  fi
  # Insert canonical footer before </body> (or at end if no </body>)
  if grep -qi '</body>' "$FILE"; then
    perl -0777 -pe 's#</body>#$ENV{CANON_FOOTER}\n</body>#i' -i "$FILE"
  else
    printf "\n%s\n" "$CANON_FOOTER" >> "$FILE"
  fi
  # Ensure nothing before header
  strip_anything_before_header "$FILE"
  # Ensure head bits
  inject_head_bits "$FILE"
  # Normalise Home link to /homepage/ wherever applicable
  perl -0777 -pe 's#(<a\b[^>]*href=")(?:/|\./|/index\.html|index\.html)("[^>]*>\s*(?:Home|Homepage)\s*<)#${1}/homepage/${2}#is' -i "$FILE"
  perl -0777 -pe 's#/homepage/homepage\.html#/homepage/#gi' -i "$FILE"
done

# Optional: if you want to enforce across ALL pages (uncomment next block)
# find "$SITE_ROOT" -type f -name "*.html" -print0 | while IFS= read -r -d '' FILE; do
#   inject_head_bits "$FILE"
#   strip_anything_before_header "$FILE"
# done

# ====== 3) Verification ======
echo "→ Verifying header/footer equality across all pages…"
fail=0
find "$SITE_ROOT" -type f -name "*.html" -print0 | while IFS= read -r -d '' FILE; do
  rel="${FILE#$SITE_ROOT/}"
  # Ensure canonical header/footer blocks are present verbatim
  if ! perl -0777 -e '$/ = undef; $c=<>; exit(index($c, $ENV{CANON_HEADER})>=0 ? 0 : 1);' "$FILE"; then
    echo "✗ Header mismatch (canonical block not found) in $rel"; fail=1
  fi
  if ! perl -0777 -e '$/ = undef; $c=<>; exit(index($c, $ENV{CANON_FOOTER})>=0 ? 0 : 1);' "$FILE"; then
    echo "✗ Footer mismatch (canonical block not found) in $rel"; fail=1
  fi
  # Ensure Home link points to /homepage/
  if ! grep -q 'href="/homepage/"' "$FILE"; then
    echo "✗ Home link not set to /homepage/ in $rel"; fail=1
  fi
  # Ensure no DOM before header inside body
  PRE="$(perl -0777 -ne 'print $1 if /<body\b[^>]*>(.*?)(<header[^>]*class=\"[^\"]*\\bheader\\b)/is' "$FILE")"
  if echo "$PRE" | grep -Eq '<nav|top-strip|legacy-header|dev-header|nexa-mobile-header'; then
    echo "✗ Pre-header elements still found in $rel"; fail=1
  fi
done

if [ "$fail" -ne 0 ]; then
  echo "Verification failed. Aborting packaging."; exit 1
fi
echo "✓ Verification passed."

# ====== 4) Package output ZIP ======
echo "→ Creating ZIP: $OUT_ZIP"
(
  cd "$WORKDIR/site"
  # Ensure neat homepage route: homepage/index.html
  if [ -f "homepage/homepage.html" ]; then
    mkdir -p homepage
    mv -f "homepage/homepage.html" "homepage/index.html"
  fi
  zip -qr "$OUT_ZIP" .
)

echo ""
echo "✅ Done."
echo "New ZIP ready to upload to Hostinger:"
echo "  $OUT_ZIP"
echo ""
echo "Notes:"
echo " • Headers on Security, Resources, About are byte-for-byte identical to Home."
echo " • One responsive header is used; mobile layout follows your mockup (two-row grid)."
echo " • Footer is identical everywhere."


