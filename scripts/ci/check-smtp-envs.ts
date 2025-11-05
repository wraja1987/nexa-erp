/* eslint-disable no-console */
const required = ['SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASSWORD'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.warn('[SMTP CHECK] Missing SMTP envs:', missing.join(','));
  process.exit(0); // warn only
}
console.log('[SMTP CHECK] SMTP envs present.');


