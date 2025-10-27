#!/usr/bin/env bash
set -euo pipefail

# ===================== CONFIG (ready) =====================
SMTP_USER="info@nexaai.co.uk"
SMTP_PASS="yrnsgxoltbuntnlm"              # keep as requested
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"                           # 587=tls (STARTTLS), 465=smtps
FROM_NAME="Nexa"
TO_ADDR="info@nexaai.co.uk"
SUCCESS_REDIRECT="/contact/thanks.html"
PHPMailerVer="v6.9.1"
# =========================================================

# Paths
WEBROOT="${PWD}"
CONTACT_DIR="${WEBROOT}/contact"
VENDOR_DIR="${CONTACT_DIR}/vendor/phpmailer/src"
LOG_DIR="${CONTACT_DIR}/logs"
STAMP="$(date +%Y%m%d-%H%M%S)"
DESKTOP="${HOME}/Desktop"
ZIP="${DESKTOP}/nexa-website-contact-smtp-${STAMP}.zip"

echo "[1/10] Create structure"
mkdir -p "${VENDOR_DIR}" "${LOG_DIR}"

echo "[2/10] Fetch PHPMailer (${PHPMailerVer})"
curl -fsSL "https://raw.githubusercontent.com/PHPMailer/PHPMailer/${PHPMailerVer}/src/PHPMailer.php" -o "${VENDOR_DIR}/PHPMailer.php"
curl -fsSL "https://raw.githubusercontent.com/PHPMailer/PHPMailer/${PHPMailerVer}/src/SMTP.php"      -o "${VENDOR_DIR}/SMTP.php"
curl -fsSL "https://raw.githubusercontent.com/PHPMailer/PHPMailer/${PHPMailerVer}/src/Exception.php" -o "${VENDOR_DIR}/Exception.php"

echo "[3/10] Write contact/.env with SMTP secrets"
cat > "${CONTACT_DIR}/.env" <<'ENVEOF'
SMTP_HOST=@SMTP_HOST@
SMTP_PORT=@SMTP_PORT@
SMTP_USER=@SMTP_USER@
SMTP_PASS=@SMTP_PASS@
FROM_ADDR=@SMTP_USER@
FROM_NAME=@FROM_NAME@
TO_ADDR=@TO_ADDR@
TO_NAME=Nexa Super Admin
SUCCESS_REDIRECT=@SUCCESS_REDIRECT@
ENVEOF

# sed cross-platform
sedi() { if sed --version >/dev/null 2>&1; then sed -i "$@"; else sed -i '' "$@"; fi; }
sedi "s|@SMTP_HOST@|${SMTP_HOST}|g" "${CONTACT_DIR}/.env"
sedi "s|@SMTP_PORT@|${SMTP_PORT}|g" "${CONTACT_DIR}/.env"
sedi "s|@SMTP_USER@|${SMTP_USER}|g" "${CONTACT_DIR}/.env"
sedi "s|@SMTP_PASS@|${SMTP_PASS}|g" "${CONTACT_DIR}/.env"
sedi "s|@FROM_NAME@|${FROM_NAME}|g" "${CONTACT_DIR}/.env"
sedi "s|@TO_ADDR@|${TO_ADDR}|g" "${CONTACT_DIR}/.env"
sedi "s|@SUCCESS_REDIRECT@|${SUCCESS_REDIRECT}|g" "${CONTACT_DIR}/.env"

echo "[4/10] Protect secrets and logs via .htaccess"
cat > "${CONTACT_DIR}/.htaccess" <<'HTEOF'
# Deny direct access to secrets and logs
<Files ".env">
  Require all denied
</Files>
Options -Indexes
RewriteEngine On
RewriteRule ^logs/ - [F,L]
HTEOF
cat > "${LOG_DIR}/.htaccess" <<'HTEOF'
Options -Indexes
Require all denied
HTEOF

echo "[5/10] Ensure thanks page exists"
mkdir -p "${WEBROOT}/contact"
if [ ! -f "${WEBROOT}/contact/thanks.html" ]; then
cat > "${WEBROOT}/contact/thanks.html" <<'HTMEOF'
<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Message sent</title>
<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif;margin:40px;line-height:1.5} .box{max-width:520px}</style>
<body><div class="box"><h1>Thank you</h1><p>Your message has been sent. We will reply from <strong>info@nexaai.co.uk</strong>.</p></div></body></html>
HTMEOF
fi

echo "[6/10] Create a minimal contact form only if missing (preserves existing page)"
if [ ! -f "${WEBROOT}/contact/index.html" ]; then
cat > "${WEBROOT}/contact/index.html" <<'HTMEOF'
<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Contact Nexa</title>
<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif;margin:40px;line-height:1.5} form{max-width:520px;display:grid;gap:12px} input,textarea,button{font:inherit;padding:10px;border:1px solid #ccc;border-radius:6px} button{background:#0a5;color:#fff;border:0;cursor:pointer}</style>
<body>
<h1>Contact us</h1>
<form method="post" action="send.php" novalidate>
  <input type="text" name="name" placeholder="Your name" required>
  <input type="email" name="email" placeholder="Your email" required>
  <input type="tel" name="phone" placeholder="Phone (optional)">
  <textarea name="message" placeholder="Your message" rows="6" required></textarea>
  <input type="text" name="website" style="display:none" tabindex="-1" autocomplete="off">
  <button type="submit">Send message</button>
</form>
</body></html>
HTMEOF
fi

echo "[7/10] Write contact/send.php (PHPMailer over Gmail SMTP)"
cat > "${CONTACT_DIR}/send.php" <<'PHPEOF'
<?php
declare(strict_types=1);

// Load env
$envPath = __DIR__ . '/.env';
if (!is_file($envPath)) { http_response_code(500); exit('Server not ready.'); }
$vars = [];
foreach (file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
  if (strpos($line, '=') !== false) {
    [$k,$v] = explode('=', $line, 2);
    $vars[trim($k)] = trim($v);
  }
}
$SMTP_HOST = $vars['SMTP_HOST'] ?? 'smtp.gmail.com';
$SMTP_PORT = (int)($vars['SMTP_PORT'] ?? '587');
$SMTP_USER = $vars['SMTP_USER'] ?? '';
$SMTP_PASS = $vars['SMTP_PASS'] ?? '';
$FROM_ADDR = $vars['FROM_ADDR'] ?? $SMTP_USER;
$FROM_NAME = $vars['FROM_NAME'] ?? 'Nexa';
$TO_ADDR   = $vars['TO_ADDR']   ?? $SMTP_USER;
$TO_NAME   = $vars['TO_NAME']   ?? 'Nexa Super Admin';
$SUCCESS_REDIRECT = $vars['SUCCESS_REDIRECT'] ?? '/contact/thanks.html';
$LOG_DIR = __DIR__ . '/logs';

// PHPMailer
require_once __DIR__ . '/vendor/phpmailer/src/PHPMailer.php';
require_once __DIR__ . '/vendor/phpmailer/src/SMTP.php';
require_once __DIR__ . '/vendor/phpmailer/src/Exception.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Only POST
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') { http_response_code(405); exit('Method Not Allowed'); }

// Fields
$name     = trim($_POST['name']    ?? '');
$email    = trim($_POST['email']   ?? '');
$phone    = trim($_POST['phone']   ?? '');
$message  = trim($_POST['message'] ?? '');
$website  = trim($_POST['website'] ?? ''); // honeypot

// Validate
if ($website !== '') { http_response_code(200); exit('OK'); } // bot
if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $message === '') {
  http_response_code(422); exit('Invalid form data.');
}
if (strlen($message) > 5000) { http_response_code(413); exit('Message too long.'); }

// Send
$mail = new PHPMailer(true);
try {
  $mail->isSMTP();
  $mail->Host       = $SMTP_HOST;
  $mail->Port       = $SMTP_PORT;
  $mail->SMTPAuth   = true;
  $mail->SMTPSecure = ($SMTP_PORT === 465) ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
  $mail->Username   = $SMTP_USER;
  $mail->Password   = $SMTP_PASS;
  $mail->CharSet    = 'UTF-8';

  $mail->setFrom($FROM_ADDR, $FROM_NAME);   // must match authenticated user on Gmail
  $mail->addAddress($TO_ADDR, $TO_NAME);    // super admin inbox
  $mail->addReplyTo($email, $name);         // reply goes to sender

  $mail->Subject = 'New website enquiry';
  $body  = "Name: {$name}\nEmail: {$email}\n";
  if ($phone !== '') { $body .= "Phone: {$phone}\n"; }
  $body .= "Message:\n{$message}\n";
  $mail->isHTML(false);
  $mail->Body = $body;

  if (!$mail->send()) {
    throw new Exception($mail->ErrorInfo ?: 'Send returned false');
  }

  if ($SUCCESS_REDIRECT) {
    header('Location: ' . $SUCCESS_REDIRECT, true, 302); exit;
  }
  exit('Message sent.');
} catch (Exception $e) {
  if (!is_dir($LOG_DIR)) { @mkdir($LOG_DIR, 0755, true); }
  $stamp = date('Ymd-His'); $id = substr(sha1($stamp . random_int(0, PHP_INT_MAX)), 0, 6);
  $logFile = $LOG_DIR . "/mail-debug-{$stamp}-{$id}.json";
  $clientIp = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? ($_SERVER['REMOTE_ADDR'] ?? null);
  $payload = [
    'time' => $stamp,
    'error' => $e->getMessage(),
    'errorInfo' => property_exists($mail, 'ErrorInfo') ? $mail->ErrorInfo : null,
    'smtp' => ['host'=>$SMTP_HOST,'port'=>$SMTP_PORT,'secure'=>($SMTP_PORT===465?'smtps':'tls'),'user'=>$SMTP_USER],
    'form' => ['name'=>$name,'email'=>$email,'phone'=>$phone],
    'client' => $clientIp,
  ];
  @file_put_contents($logFile, json_encode($payload, JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE));
  http_response_code(500);
  echo "Send failed. Log: " . basename($logFile);
  exit;
}
PHPEOF

echo "[8/10] Optional local PHP syntax check"
if command -v php >/dev/null 2>&1; then php -l "${CONTACT_DIR}/send.php" >/dev/null; else echo "php not found locally; skipping syntax check"; fi

echo "[9/10] Build ZIP to Desktop"
cd "${WEBROOT}"
# Create a temp archive in repo, then move to Desktop to avoid packaging the ZIP itself
TMPZIP=".nexa-contact-${STAMP}.zip"
zip -rq "${TMPZIP}" . -x "*.git*" "*node_modules/*" "*dist/*" "*README.md" "*DS_Store"
mv "${TMPZIP}" "${ZIP}"

echo "[10/10] Done"
echo "ZIP saved: ${ZIP}"
echo
echo "Upload to Hostinger → /public_html/ (Extract, overwrite existing /contact files)."
echo "Test https://nexaai.co.uk/contact/ → expect redirect to ${SUCCESS_REDIRECT} and email to ${TO_ADDR}."
echo "If failure: check /public_html/contact/logs/mail-debug-*.json on the server."
