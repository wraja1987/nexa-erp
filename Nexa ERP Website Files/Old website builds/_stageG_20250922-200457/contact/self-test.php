<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/smtp_helper_debug.php';
$to=constant('MAIL_TO');$from=constant('MAIL_FROM_EMAIL');
$subj='Nexa SELF-TEST '.date('Y-m-d H:i:s');
$body="Gmail SMTP self-test. If you see this at $to, Gmail SMTP works.";
list($ok,$logfile)=nexa_smtp_send_debug(constant('SMTP_HOST'),constant('SMTP_PORT'),constant('SMTP_SECURE'),constant('SMTP_USERNAME'),constant('SMTP_PASSWORD'),$from,$to,$subj,$body,constant('MAIL_FROM_NAME'));
header('Content-Type: text/plain; charset=utf-8');
echo $ok?"✅ SMTP send OK. Check inbox: $to\nLog: ".basename($logfile)."\n":"❌ SMTP send FAILED. See log: ".basename($logfile)."\n";
?>
