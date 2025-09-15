import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2024-06-20" });

export async function POST() {
  const token = await stripe.terminal.connectionTokens.create({});
  return NextResponse.json({ secret: token.secret });
}
