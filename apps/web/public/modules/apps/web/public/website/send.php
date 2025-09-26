<?php
// Step 3: Contact form via PHPMailer SMTP (no Composer)
require __DIR__ . '/vendor/phpmailer/phpmailer/src/PHPMailer.php';
require __DIR__ . '/vendor/phpmailer/phpmailer/src/SMTP.php';
require __DIR__ . '/vendor/phpmailer/phpmailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');

function fail($msg, $code=400){ http_response_code($code); echo json_encode(['ok'=>false,'error'=>$msg]); exit; }

$required = ['name','email','message'];
foreach ($required as $r) if (empty($_POST[$r])) fail("Missing: $r");

$email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
if (!$email) fail('Invalid email');

$name = trim($_POST['name']);
$msg = trim($_POST['message']);

try {
  $mail = new PHPMailer(true);
  $mail->isSMTP();
  $mail->Host = getenv('SMTP_HOST') ?: 'smtp.hostinger.com';
  $mail->SMTPAuth = true;
  $mail->Username = getenv('SMTP_USER') ?: 'noreply@nexaai.co.uk';
  $mail->Password = getenv('SMTP_PASS') ?: '';
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
  $mail->Port = getenv('SMTP_PORT') ?: 587;

  $mail->setFrom($mail->Username, 'Nexa Website');
  $mail->addAddress(getenv('CONTACT_TO') ?: 'hello@nexaai.co.uk');
  $mail->addReplyTo($email, $name);

  $mail->Subject = 'New contact form submission';
  $mail->Body = "Name: $name\nEmail: $email\nMessage:\n$msg\n";

  $mail->send();
  echo json_encode(['ok'=>true]);
} catch (Exception $e) {
  fail('Mailer error');
}
