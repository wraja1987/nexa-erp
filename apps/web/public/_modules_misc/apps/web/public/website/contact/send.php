<?php
require_once __DIR__ . '/config.php';

require __DIR__ . '/../vendor/phpmailer/phpmailer/src/PHPMailer.php';
require __DIR__ . '/../vendor/phpmailer/phpmailer/src/SMTP.php';
require __DIR__ . '/../vendor/phpmailer/phpmailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');

function fail($msg, $code=400){ http_response_code($code); echo json_encode(['ok'=>false,'error'=>$msg]); exit; }

$first   = trim($_POST['first']   ?? '');
$last    = trim($_POST['last']    ?? '');
$name    = trim($_POST['name']    ?? ($first . ($last ? " $last" : '')));
$email   = trim($_POST['email']   ?? ($_POST['your-email']   ?? ''));
$message = trim($_POST['message'] ?? ($_POST['your-message'] ?? ''));

if ($name === '')    fail('Missing: name');
if ($email === '')   fail('Missing: email');
if ($message === '') fail('Missing: message');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('Invalid email');

try {
  $mail = new PHPMailer(true);
  $mail->isSMTP();
  $mail->Host       = constant('SMTP_HOST');
  $mail->SMTPAuth   = true;
  $mail->Username   = constant('SMTP_USERNAME');
  $mail->Password   = constant('SMTP_PASSWORD');
  $mail->Port       = intval(constant('SMTP_PORT'));

  $secure = strtolower(constant('SMTP_SECURE'));
  if ($secure === 'ssl') {
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
  } else {
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
  }

  $mail->setFrom(constant('MAIL_FROM_EMAIL'), constant('MAIL_FROM_NAME'));
  $mail->addAddress($email, $name);
  $mail->addReplyTo(constant('MAIL_FROM_EMAIL'), constant('MAIL_FROM_NAME'));

  $mail->Subject = 'Thanks — we\'ve received your message';
  $mail->Body    = "Hi $name,\n\nThanks for contacting us. We\'ve received your message and will reply shortly.\n\nYou sent:\n$message\n\n— " . constant('MAIL_FROM_NAME');

  $mail->send();
  echo json_encode(['ok'=>true]);
} catch (Exception $e) {
  fail('Mailer error');
}
