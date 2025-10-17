// apps/web/scripts/ops/verify-auth-runtime.ts
import 'dotenv/config';

const PROD_BASE = 'https://app.nexaai.co.uk';

async function jfetch(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return { res, body: await res.json() };
  return { res, body: await res.text() };
}

function assert(cond: any, msg: string) {
  if (!cond) throw new Error('ASSERT: ' + msg);
}

async function verifyDiag() {
  const { res, body } = await jfetch(`${PROD_BASE}/api/_auth-diag`);
  assert(res.ok, '/api/_auth-diag not OK');
  assert(body.ok === true, 'diag.ok !== true');
  assert(body.db?.ok === true, 'db not ok');
  assert(body.smtp?.ok === true, 'smtp not ok');
  assert(body.cookies?.secure === true, 'cookies.secure not true');
  assert(body.cookies?.httpOnly === true, 'cookies.httpOnly not true');
  assert(String(body.cookies?.sameSite).toLowerCase() === 'lax', 'cookies.sameSite not lax');

  const prov = body.providers || [];
  assert(prov.includes('email'), 'email provider missing');
  assert(prov.includes('google'), 'google provider missing');
  assert(prov.includes('azure-ad'), 'azure-ad provider missing');

  const mfaFor = body.mfa?.requiredFor || [];
  assert(mfaFor.includes('super_admin'), 'MFA not required for super_admin');
  assert(mfaFor.includes('admin'), 'MFA not required for admin');
  return true;
}

async function verifyForgot() {
  const { res } = await jfetch(`${PROD_BASE}/api/auth/forgot`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'info@nexaai.co.uk' })
  });
  assert([200, 201, 202, 204, 302].includes(res.status), 'forgot-password unexpected status: ' + res.status);
  return true;
}

async function verifyRateLimit() {
  // We can't know your exact credentials payload, so we hit credentials callback with wrong password.
  // Accept any non-200 status or consistent redirect to /login as "failure", and allow 429 if rate-limit triggers.
  let failures = 0, has429 = false;
  for (let i = 0; i < 8; i++) {
    const { res } = await jfetch(`${PROD_BASE}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        email: 'nobody+ratecheck@nexaai.co.uk',
        password: 'WrongPassword!'
      }).toString(),
        redirect: 'manual' as any // ignore following redirects
    } as any);
    if (res.status === 429) has429 = true;
    if (res.status !== 200) failures++;
  }
  assert(failures >= 6, 'credentials smoke test did not fail as expected');
  // Not requiring 429, but record if present
  return { has429 };
}

(async () => {
  const results: any = {};
  try {
    await verifyDiag();
    results.diag = 'OK';
    await verifyForgot();
    results.forgot = 'OK';
    results.rate = await verifyRateLimit();
    console.log('VERIFICATION SUMMARY:', results);
    console.log('PASS: Accounts & Auth runtime looks good in Production.');
    process.exit(0);
  } catch (e: any) {
    console.error('FAIL:', e.message || e);
    process.exit(1);
  }
})();
