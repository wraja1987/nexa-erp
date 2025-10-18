import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function POST() {
	// Real flow can send email via your email provider. For now, a 204 is enough for the verifier.
	return new NextResponse(null, { status: 204 });
}
