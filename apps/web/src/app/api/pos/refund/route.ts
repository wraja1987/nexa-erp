import { stripe } from "@/lib/stripe";
import { auditPOS } from "@/lib/pos/audit";
import { currentUser } from "@/lib/rbac";
import { NextRequest } from "next/server";
export async function POST(req: NextRequest){
  const user = currentUser();
  const { payment_intent_id, amount } = await req.json();
  if(!payment_intent_id) return new Response(JSON.stringify({error:"Missing payment_intent_id"}),{status:400});
  const refund = await stripe.refunds.create({ payment_intent: payment_intent_id, amount });
  await auditPOS("refund.created", { user:user.id, pi: payment_intent_id, refund: refund.id, amount: refund.amount });
  return new Response(JSON.stringify({ ok:true, refund }), { status:200, headers:{ "content-type":"application/json" }});
}
