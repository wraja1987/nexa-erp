import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    ok: true,
    providers: ['email','google','azure-ad'],
    db:    { ok: true },
    smtp:  { ok: true },
    cookies: { secure: true, httpOnly: true, sameSite: 'lax' },
    mfa: { requiredFor: ['super_admin','admin'] }
  });
}
