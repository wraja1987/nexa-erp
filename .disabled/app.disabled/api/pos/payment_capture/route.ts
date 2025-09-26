import { stripe } from "@/lib/stripe";
import { auditPOS } from "@/lib/pos/audit";
import { currentUser } from "@/lib/rbac";
import { NextRequest } from "next/server";
export async function POST(req: NextRequest){
  const user = currentUser();
  const { payment_intent_id, amount_to_capture } = await req.json();
  if(!payment_intent_id) return new Response(JSON.stringify({error:"Missing payment_intent_id"}),{status:400});
  const captured = await stripe.paymentIntents.capture(payment_intent_id, amount_to_capture ? { amount_to_capture } : undefined);
  await auditPOS("payment_intent.captured", { user:user.id, pi: captured.id, amount: captured.amount_received });
  return new Response(JSON.stringify({ ok:true, payment_intent: captured }), { status:200, headers:{ "content-type":"application/json" }});
}
