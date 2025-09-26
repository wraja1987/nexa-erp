import { stripe } from "@/lib/stripe";
import { auditPOS } from "@/lib/pos/audit";
import { currentUser } from "@/lib/rbac";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest){
  const user = currentUser();
  const { amount, currency="gbp", metadata={} } = await req.json();
  if(!amount || amount<=0) return new Response(JSON.stringify({error:"Invalid amount"}),{status:400});
  const pi = await stripe.paymentIntents.create({
    amount, currency,
    payment_method_types: ["card_present"],
    capture_method: "manual", // allow explicit capture step
    metadata: { source:"nexa-pos", ...metadata }
  });
  await auditPOS("payment_intent.created", { user:user.id, pi: pi.id, amount, currency });
  return new Response(JSON.stringify({ id:pi.id, client_secret: pi.client_secret }),{status:200,headers:{ "content-type":"application/json" }});
}
