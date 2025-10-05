import type { NextApiRequest, NextApiResponse } from "next";
import { getRedis } from "../../../lib/redis";
import { key } from "../../../utils/otp";

export default async function handler(req:NextApiRequest, res:NextApiResponse){
  try{
    if(req.method!=="POST") return res.status(405).end();
    const { email, code } = req.body || {};
    if(!email || !code) return res.status(400).json({error:"email_and_code_required"});

    const redis = await getRedis();
    const k = key(email);
    const stored = await redis.get(k);
    if(!stored) return res.status(400).json({ ok:false, reason:"expired_or_missing" });
    if(stored !== code) return res.status(401).json({ ok:false, reason:"invalid" });

    await redis.del(k);
    // Set a short-lived session cookie that marks 2FA complete (handled client-side)
    res.setHeader("Set-Cookie", `nexa_2fa_ok=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=900`);
    return res.status(200).json({ ok:true });
  }catch(e:any){
    console.error(e);
    return res.status(500).json({error:"server_error"});
  }
}
