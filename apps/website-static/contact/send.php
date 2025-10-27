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
