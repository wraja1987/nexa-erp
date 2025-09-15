import Stripe from "stripe";
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" } as any);
export const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
