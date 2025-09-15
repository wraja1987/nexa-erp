import { stripe } from "@/lib/stripe";
import { NextRequest } from "next/server";
import { currentUser } from "@/lib/rbac";
export async function POST(_req: NextRequest){
  currentUser(); // ensure signed in (stub)
  const token = await stripe.terminal.connectionTokens.create();
  return new Response(JSON.stringify({ secret: token.secret }), { status:200, headers:{ "content-type":"application/json" }});
}
