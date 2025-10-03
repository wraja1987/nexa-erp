import type { NextApiResponse } from "next";
import fs from "fs"; import path from "path";
import { getRedis } from "./redis"; import { auditLog } from "./audit";
import { metrics } from "./metrics";

const g=globalThis as any; g.__NEXA_IDEM_MEM=g.__NEXA_IDEM_MEM||new Map<string,number>();
const mem:Map<string,number>=g.__NEXA_IDEM_MEM;
function idemFile(key:string){ const root=process.env.PROJECT_ROOT||process.cwd(); const dir=path.join(root,".next","idem-test"); try{fs.mkdirSync(dir,{recursive:true})}catch{} return path.join(dir,Buffer.from(key).toString("base64")+".txt"); }

export async function ensureIdempotent(key:string,ttlSec?:number):Promise<"ok"|"duplicate">{
  const ttl=Number(ttlSec??process.env.IDEMPOTENCY_TTL_SEC??60); const now=Date.now();
  try{const r=getRedis(); const nx=await r.set(`idem:${key}`,"1","EX",ttl,"NX"); return nx?"ok":"duplicate"; }
  catch{try{const f=idemFile(key); const raw=fs.existsSync(f)?Number(fs.readFileSync(f,"utf8")):0;
    if(raw&&raw>now)return"duplicate"; fs.writeFileSync(f,String(now+ttl*1000)); return"ok";}
    catch{const exp=mem.get(key); if(exp&&exp>now)return"duplicate"; mem.set(key,now+ttl*1000); return"ok";}}
}

export async function withIdempotency(res:NextApiResponse,makeKey:()=>string,ttlSec?:number):Promise<boolean>{
  const key=makeKey(); const state=await ensureIdempotent(key,ttlSec);
  if(state==="duplicate"){
    res.status(202).json({ ok: true, deduped: true });
    try { metrics.idemSkips.inc({ key }); } catch {}
    auditLog({ type:"idempotency_skip", key });
    return false;
  }
  return true;
}
export function stripeEventKey(eventId:string){return`stripe_evt_${eventId}`;}
