import nodemailer from "nodemailer";

async function main() {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM;

  if (!smtpUser || !smtpPass || !smtpFrom) {
    console.error("Missing SMTP env vars");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const recipients = [smtpUser, "nexaaierp@gmail.com"]; 

  const info = await transporter.sendMail({
    from: smtpFrom,
    to: recipients.join(","),
    subject: "Nexa SMTP Deliverability Test",
    text: "This is a test message from Nexa ERP to verify SMTP deliverability.",
  });

  console.log("Test email sent. Check Gmail > Show original for SPF/DKIM/DMARC.");
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});

