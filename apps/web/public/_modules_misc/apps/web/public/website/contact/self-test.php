<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/smtp_helper_debug.php';

$to   = constant('MAIL_TO');
$from = constant('MAIL_FROM_EMAIL');
$subj = "Nexa SELF-TEST ".date('Y-m-d H:i:s');
$body = "This is a Nexa website SMTP self-test.\nIf you see this at $to, SMTP delivery works.\nIP: ".($_SERVER['REMOTE_ADDR'] ?? 'unknown');

list($ok,$logfile) = nexa_smtp_send_debug(
  constant('SMTP_HOST'),
  constant('SMTP_PORT'),
  constant('SMTP_SECURE'),
  constant('SMTP_USERNAME'),
  constant('SMTP_PASSWORD'),
  $from,
  $to,
  $subj,
  $body,
  constant('MAIL_FROM_NAME')
);

if ($ok) {
  echo "✅ SMTP send OK. Check inbox: $to\n";
  echo "Log: ".basename($logfile)."\n";
  exit;
} else {
  echo "❌ SMTP send FAILED. See log: ".basename($logfile)."\n";
  echo "Tip: If your mailbox is on GoDaddy, use:\n";
  echo "  SMTP_HOST=smtpout.secureserver.net, SMTP_PORT=465 (ssl) or 587 (tls)\n";
  echo "  SMTP_USERNAME = your full mailbox (e.g., no-reply@nexaai.co.uk)\n";
  exit;
}
?>
