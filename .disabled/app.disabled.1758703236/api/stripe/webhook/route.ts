import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2024-06-20" });

export async function POST(req: Request) {
  const sig = (await headers()).get("stripe-signature") || "";
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = await req.text();

  if (!whSecret) {
    return NextResponse.json({ ok: false, error: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, whSecret);
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: `Signature verification failed: ${err.message}` }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded":
    case "payment_intent.payment_failed":
    case "charge.refunded":
    case "terminal.reader.action_succeeded":
    case "terminal.reader.action_failed":
    case "terminal.connection_token.created":
      break;
    default:
      break;
  }

  return NextResponse.json({ ok: true });
}
