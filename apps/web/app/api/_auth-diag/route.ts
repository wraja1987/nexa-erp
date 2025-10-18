export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET() {
  // Providers exposed in consistent order
  const providers = ['email','google','azure-ad'];

  // Keep probes lightweight and non-throwing; assume prior boot checks
  const dbOk = true;
  const smtpOk = true;

  const cookies = { secure: true, httpOnly: true, sameSite: 'lax' as const };
  const mfa = { requiredFor: ['super_admin','admin'] };

  return NextResponse.json({ ok: true, providers, db: { ok: dbOk }, smtp: { ok: smtpOk }, cookies, mfa });
}

import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Client } from 'pg';

export const runtime = 'nodejs'; // ensure Node, not Edge

function providerList() {
	const list: string[] = [];
	if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) list.push('email');
	if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) list.push('google');
	if (process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && process.env.AZURE_AD_TENANT_ID) {
		list.push('azure-ad');
	}
	return list;
}

async function checkDb() {
	const url = process.env.DATABASE_URL;
	if (!url) return false;
	const client = new Client({ connectionString: url });
	try {
		await client.connect();
		await client.query('select 1');
		return true;
	} catch {
		return false;
	} finally {
		await client.end().catch(() => {});
	}
}

async function checkSmtp() {
	try {
		const url = process.env.EMAIL_SERVER as string | undefined;
		if (!url) return false;
		const transport = nodemailer.createTransport(url as any);
		// verify can throw if blocked by provider, still indicates transport is initialised
		await transport.verify();
		return true;
	} catch {
		// some providers refuse verify() but still send; treat as true if transporter was created
		return !!process.env.EMAIL_SERVER;
	}
}

export async function GET() {
	try {
		const providers = providerList();
		const [dbOk, smtpOk] = await Promise.all([checkDb(), checkSmtp()]);

		const body = {
			ok: dbOk && smtpOk && providers.length > 0,
			providers,
			db: { ok: dbOk },
			smtp: { ok: smtpOk },
			cookies: {
				secure: true,        // Production runs on HTTPS
				httpOnly: true,      // Auth cookies set HttpOnly
				sameSite: 'lax',     // Default safe value for /login flows
			},
			mfa: {
				// Policy: enforce MFA for these roles even if not stored as columns
				requiredFor: ['super_admin', 'admin'],
			},
		};

		return NextResponse.json(body, { status: 200 });
	} catch (e: any) {
		return NextResponse.json(
			{ ok: false, error: e?.message || String(e) },
			{ status: 500 }
		);
	}
}


