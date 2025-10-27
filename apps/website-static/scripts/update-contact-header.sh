#!/usr/bin/env bash
set -euo pipefail

# ===== Paths =====
WEBROOT="${PWD}"
CONTACT_DIR="${WEBROOT}/contact"
DESKTOP="${HOME}/Desktop"
STAMP="$(date +%Y%m%d-%H%M%S)"
ZIP="${DESKTOP}/nexa-contact-header-update-${STAMP}.zip"

echo "[1/5] Ensure contact directory exists"
mkdir -p "${CONTACT_DIR}"

echo "[2/5] Backup existing contact/index.html if present"
if [ -f "${CONTACT_DIR}/index.html" ]; then
  cp -v "${CONTACT_DIR}/index.html" "${CONTACT_DIR}/index.backup-${STAMP}.html"
fi

echo "[3/5] Append/seed header styles in contact.css"
if [ ! -f "${CONTACT_DIR}/contact.css" ]; then
  cat > "${CONTACT_DIR}/contact.css" <<'BASECSS'
/* Base (kept minimal; existing page styles remain) */
:root{--border:#e8ecf3}
.container{max-width:980px;margin:0 auto;padding:0 20px}
.site-main{padding:48px 0}
.intro{margin:0 0 24px;color:#5c6476}
BASECSS
fi

cat >> "${CONTACT_DIR}/contact.css" <<'CSS'
/* === Nexa header (exact layout) === */
.site-header{background:#fff;border-bottom:1px solid #e8ecf3;box-shadow:0 1px 4px rgba(0,0,0,.03);position:sticky;top:0;z-index:100}
.header-container{max-width:1250px;margin:0 auto;padding:12px 20px;display:flex;justify-content:space-between;align-items:center}
.header-left{display:flex;align-items:center;gap:32px}
.brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:17px;text-decoration:none;color:#0b1220}
.brand-text{font-weight:700;color:#0b1220}
.nav-links{display:flex;gap:28px}
.nav-links a{text-decoration:none;color:#0b1220;font-weight:700;letter-spacing:.1px;padding:0 0 2px}
.nav-links a:hover{opacity:.75}
.nav-links a.active{color:#0b1220;border-bottom:2px solid #0b1220}
.header-right{display:flex;align-items:center}
.login-btn{background:#fff;border:1px solid rgba(13,27,42,.15);border-radius:999px;padding:8px 20px;font-weight:700;color:#0b1220;text-decoration:none;box-shadow:0 3px 10px rgba(13,27,42,.08);transition:background .2s ease,box-shadow .2s ease}
.login-btn:hover{background:#f8f9fc;box-shadow:0 5px 16px rgba(13,27,42,.12)}
CSS


echo "[4/5] Write contact/index.html with exact header + updated sub-headline (form posts to existing send.php)"
cat > "${CONTACT_DIR}/index.html" <<'HTML'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Contact Nexa</title>
  <meta name="description" content="Contact Nexa. Ask a question or request a demo.">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="./contact.css">
  <style>body{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0b1220;background:#fff}</style>
</head>
<body>

  <!-- Header (exactly as requested) -->
  <header class="site-header">
    <div class="header-container">
      <div class="header-left">
        <a href="/" class="brand">
          <img src="/Nexa.png" alt="Nexa ERP" height="28">
          <span class="brand-text">Nexa ERP</span>
        </a>
        <nav class="nav-links">
          <a href="/">Home</a>
          <a href="/modules/">Modules</a>
          <a href="/integrations/">Integrations &amp; API</a>
          <a href="/security/">Security &amp; Compliance</a>
          <a href="/pricing/">Pricing</a>
          <a href="/resources/">Resources</a>
          <a href="/about/">About</a>
          <a href="/contact/" class="active">Contact</a>
        </nav>
      </div>
      <div class="header-right">
        <a href="https://app.nexaai.co.uk/login" class="login-btn">Login</a>
      </div>
    </div>
  </header>

  <!-- Main -->
  <main class="site-main">
    <div class="container">
      <h1 style="font-size:34px;line-height:1.2;margin:0 0 8px;font-weight:800">Contact Nexa</h1>
      <p class="intro">Have a question or want a demo? Fill out the form and we will get back to you within 24 hours.</p>

      <div class="card" style="background:#fff;border:1px solid var(--border);border-radius:14px;box-shadow:0 8px 20px rgba(10,20,40,.06);padding:22px">
        <form class="form" method="post" action="send.php" novalidate style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div class="field" style="display:flex;flex-direction:column;gap:8px">
            <label for="name" style="font-weight:600;color:#2a2f3a">Your name</label>
            <input id="name" name="name" type="text" placeholder="Jane Smith" required style="width:100%;padding:12px 14px;border-radius:10px;border:1px solid var(--border);background:#f7f8fc;outline:none">
          </div>

          <div class="field" style="display:flex;flex-direction:column;gap:8px">
            <label for="email" style="font-weight:600;color:#2a2f3a">Your email</label>
            <input id="email" name="email" type="email" placeholder="you@company.com" required style="width:100%;padding:12px 14px;border-radius:10px;border:1px solid var(--border);background:#f7f8fc;outline:none">
          </div>

          <div class="field" style="display:flex;flex-direction:column;gap:8px">
            <label for="phone" style="font-weight:600;color:#2a2f3a">Phone (optional)</label>
            <input id="phone" name="phone" type="tel" placeholder="+44 20 7946 0123" style="width:100%;padding:12px 14px;border-radius:10px;border:1px solid var(--border);background:#f7f8fc;outline:none">
          </div>

          <div class="field" style="display:flex;flex-direction:column;gap:8px;grid-column:1/-1">
            <label for="message" style="font-weight:600;color:#2a2f3a">Your message</label>
            <textarea id="message" name="message" placeholder="How can we help?" required style="width:100%;min-height:140px;padding:12px 14px;border-radius:10px;border:1px solid var(--border);background:#f7f8fc;outline:none;resize:vertical"></textarea>
          </div>

          <!-- Honeypot expected by send.php -->
          <div style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden">
            <label for="website">Leave this empty</label>
            <input id="website" name="website" type="text" tabindex="-1" autocomplete="off">
          </div>

          <button type="submit"
                  style="grid-column:1/-1;justify-self:start;cursor:pointer;padding:12px 18px;border-radius:12px;border:0;color:#fff;font-weight:800;background:linear-gradient(90deg,#6a5cff,#1ea0ff);box-shadow:0 8px 18px rgba(60,120,255,.28)">
            Send message
          </button>
        </form>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer style="border-top:1px solid var(--border);margin-top:48px;color:#5c6476;padding:18px 0 40px;font-size:14px">
    <div class="container">© <span id="y"></span> Nexa. All rights reserved.</div>
  </footer>
  <script>document.getElementById('y').textContent=new Date().getFullYear()</script>
</body>
</html>
HTML


echo "[5/5] Build ZIP (contact/ only) to Desktop"
cd "${CONTACT_DIR}/.."
zip -rq "${ZIP}" "contact" -x "contact/index.backup-*.html"

echo "Done."
echo "Upload ${ZIP} to Hostinger → /public_html/ and Extract (overwrite contact/index.html and contact.css only)."
echo "Hard refresh https://nexaai.co.uk/contact/ and re-test a submission to confirm backend remains OK."
