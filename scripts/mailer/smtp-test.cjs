const nodemailer = require('nodemailer');

const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM || user;

async function main() {
  if (!user || !pass) {
    console.error('Missing SMTP_USER/SMTP_PASS in env'); process.exit(1);
  }
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', port: 587, secure: false,
    auth: { user, pass },
  });
  const to = user;
  const info = await transporter.sendMail({
    from, to,
    subject: 'Nexa SMTP Deliverability Test',
    text: 'This is a Nexa SMTP test. In Gmail, open "Show original" and confirm SPF/DKIM/DMARC = PASS.'
  });
  console.log('Sent:', info.messageId);
}
main().catch(e=>{ console.error(e); process.exit(1); });
