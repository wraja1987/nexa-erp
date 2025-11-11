import { NextRequest } from "next/server";
import Stripe from "stripe";
import { auditEvent } from "@/lib/observability/audit";

export async function POST(req: NextRequest) {
	try {
		const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
		const key = process.env.STRIPE_SECRET_KEY;
		if (!key || !whSecret) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
		const raw = await req.text();
		const sig = req.headers.get("stripe-signature") || "";
		const stripe = new Stripe(key, { apiVersion: "2024-06-20", appInfo: { name: "Nexa ERP" } });
		let event: Stripe.Event;
		try {
			event = stripe.webhooks.constructEvent(raw, sig, whSecret);
		} catch (e: any) {
			return Response.json({ ok: false, error: "signature_invalid" }, { status: 400 });
		}
		// Handle a subset of events with audit logging; DB updates will be applied in Task 2 migration release.
		switch (event.type) {
			case "checkout.session.completed": {
				const s = event.data.object as Stripe.Checkout.Session;
				await auditEvent("billing.webhook.applied", {
					type: event.type,
					customer: s.customer,
					subscription: s.subscription,
					price: (s.line_items as any)?.data?.[0]?.price?.id,
				}).catch(()=>{});
				break;
			}
			case "customer.subscription.updated":
			case "customer.subscription.deleted": {
				const sub = event.data.object as Stripe.Subscription;
				await auditEvent("billing.webhook.applied", {
					type: event.type,
					customer: sub.customer,
					subscription: sub.id,
					status: sub.status,
					price: sub.items?.data?.[0]?.price?.id,
				}).catch(()=>{});
				break;
			}
			default: {
				await auditEvent("billing.webhook.ignored", { type: event.type }).catch(()=>{});
			}
		}
		return new Response("", { status: 200 });
	} catch (e: any) {
		return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: 400 });
	}
}


