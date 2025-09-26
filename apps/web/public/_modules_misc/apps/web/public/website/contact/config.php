<?php
// Host SMTP defaults — adjust only if you use GoDaddy SMTP (see self-test output).
define('USE_SMTP', true);
define('SMTP_HOST', 'smtp.hostinger.com');  // Hostinger default; will advise if GoDaddy needed
define('SMTP_PORT', 465);
define('SMTP_SECURE', 'ssl');               // or 'tls' with port 587
define('SMTP_USERNAME', 'no-reply@nexaai.co.uk');
define('SMTP_PASSWORD', 'Wolfish123!!');    // as provided
define('MAIL_TO', 'info@chiefaa.com');      // where you receive enquiries
define('MAIL_FROM_EMAIL', 'no-reply@nexaai.co.uk');
define('MAIL_FROM_NAME', 'Nexa Website');
?>
