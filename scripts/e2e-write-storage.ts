import fs from 'node:fs';

const baseURL = process.env.PW_BASE_URL || 'http://localhost:3000';
const { hostname } = new URL(baseURL);
const token = process.env.NEXA_SESSION_TOKEN!;
const out = 'apps/web/tests/e2e/.auth/state.json';

const cookieName = hostname === 'localhost' ? 'next-auth.session-token' : '__Secure-next-auth.session-token';
const expires = Math.floor(Date.now()/1000)+8*3600;

const state = {
  cookies: [{
    name: cookieName,
    value: token,
    domain: hostname,
    path: '/',
    httpOnly: true,
    secure: false,     // localhost
    sameSite: 'Lax',
    expires
  }]
};

fs.mkdirSync('apps/web/tests/e2e/.auth', { recursive: true });
fs.writeFileSync(out, JSON.stringify(state, null, 2));
console.log('Wrote', out, 'with cookie', cookieName);
