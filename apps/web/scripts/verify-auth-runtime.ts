import 'dotenv/config';
import assert from 'node:assert/strict';
import fetch from 'node-fetch';

const base = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) || 'https://app.nexaai.co.uk';

(async () => {
  const diagRes = await fetch(`${base}/api/_auth-diag`);
  const diag = await diagRes.json() as any;
  assert.equal(diagRes.status, 200);
  assert.equal(diag.ok, true);
  assert.equal(diag.db?.ok, true);
  assert.equal(diag.smtp?.ok, true);
  assert.equal(diag.cookies?.secure, true);
  assert.equal(diag.cookies?.httpOnly, true);
  assert.equal(diag.cookies?.sameSite, 'lax');
  assert.deepEqual((diag.mfa?.requiredFor || []).sort(), ['admin','super_admin'].sort());
  assert(diag.providers?.includes('email') && diag.providers?.includes('google') && diag.providers?.includes('azure-ad'));

  const providersRes = await fetch(`${base}/api/auth/providers`);
  const providers = await providersRes.json() as any;
  assert(providers.email && providers.google && providers['azure-ad']);

  const forgot = await fetch(`${base}/api/auth/forgot`, { method: 'POST' });
  assert.equal(forgot.status, 204);

  console.log('✅ Runtime verified.');
})().catch((e) => { console.error(e); process.exit(1); });



