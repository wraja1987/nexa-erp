import type { NextApiRequest, NextApiResponse } from "next";
import { getRedis } from "../../../lib/redis";
import { generateOTP, key } from "../../../utils/otp";
import { sendOtpEmail } from "../../../lib/mailer";

export default async function handler(req:NextApiRequest, res:NextApiResponse){
  try{
    if(req.method!=="POST") return res.status(405).end();
    const { email } = req.body || {};
    if(!email) return res.status(400).json({error:"email required"});

    const expMin = Number(process.env.OTP_EXP_MIN||10);
    const len = Number(process.env.OTP_LEN||6);
    const rate = Number(process.env.OTP_RATE_PER_MIN||3);

    const redis = await getRedis();
    const k = key(email);
    const rateKey = `${k}:rate:${new Date().toISOString().slice(0,16)}`; // minute bucket
    const rateCount = Number(await redis.incr(rateKey));
    await redis.expire(rateKey, 90);
    if(rateCount > rate) return res.status(429).json({error:"rate_limited"});

    const code = generateOTP(len);
    await redis.set(k, code, { EX: expMin*60 });
    await sendOtpEmail(email, code);
    return res.status(200).json({ ok:true });
  }catch(e:any){
    console.error(e);
    return res.status(500).json({error:"server_error"});
  }
}
