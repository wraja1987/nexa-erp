import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs"; import path from "path";
import { getRedis } from "./redis"; import { auditLog } from "./audit";
import { metrics } from "./metrics";

type KeyParts = { ip?: string|null; route: string; tenant?: string|null };
const g = (globalThis as any);
g.__NEXA_RL_MEM = g.__NEXA_RL_MEM || new Map<string, number[]>();
const mem: Map<string, number[]> = g.__NEXA_RL_MEM;

function hash(s: string){ let x=0; for (let i=0;i<s.length;i++){ x=((x<<5)-x)+s.charCodeAt(i); x|=0; } return String(x>>>0); }
function rlFile(key: string){ const root = process.env.PROJECT_ROOT || process.cwd(); const dir = path.join(root, ".next", "rl-test"); try{ fs.mkdirSync(dir,{recursive:true}); }catch{} return path.join(dir, hash(key)+".json"); }

function normaliseIp(raw?: string|null): string {
  let ip = (raw || "").trim();
  if (!ip) return "127.0.0.1";
  if (ip.startsWith("::ffff:")) ip = ip.substring(7);
  if (ip === "::1" || ip === "0:0:0:0:0:0:0:1") return "127.0.0.1";
  return ip;
}
function clientIp(req: NextApiRequest): string {
  if (process.env.NODE_ENV !== "production") {
    const testIp = (req.headers["x-test-ip"] as string) || "";
    if (testIp) return normaliseIp(testIp);
  }
  const xf = (req.headers["x-forwarded-for"] as string) || "";
  const first = xf.split(",")[0]?.trim();
  if (first) return normaliseIp(first);
  return normaliseIp((req.socket as any)?.remoteAddress);
}
export function buildKey({ ip, route, tenant }: KeyParts) {
  return `rl:${tenant || "anon"}:${route}:${ip || "127.0.0.1"}`;
}

async function redisCount(key: string, windowSec: number): Promise<number|null> {
  try {
    const r = getRedis(); const now = Date.now(); const ttlMs = windowSec*1000;
    const multi = r.multi();
    multi.zremrangebyscore(key,0,now-ttlMs);
    multi.zadd(key, now, String(now));
    multi.zcard(key); multi.expire(key, windowSec);
    const [, , count] = (await multi.exec()) ?? [null,null,[null,0]];
    const current = Array.isArray(count) ? Number(count[1]) : Number(count);
    return Number.isFinite(current) ? current : 0;
  } catch { return null; }
}
function memCount(key: string, windowSec: number): number {
  const now=Date.now(), cutoff=now-windowSec*1000;
  const arr = mem.get(key) ?? []; const pruned=arr.filter(t=>t>=cutoff);
  pruned.push(now); mem.set(key,pruned); return pruned.length;
}
function fileCount(key:string, windowSec:number):number{
  const f=rlFile(key); const now=Date.now(), cutoff=now-windowSec*1000;
  let arr:number[]=[]; try{arr=JSON.parse(fs.readFileSync(f,"utf8"))}catch{}
  arr=Array.isArray(arr)?arr.filter(t=>t>=cutoff):[]; arr.push(now);
  try{fs.writeFileSync(f,JSON.stringify(arr))}catch{}
  return arr.length;
}

export async function rateLimit(req:NextApiRequest,res:NextApiResponse,opts?:{windowSec?:number;max?:number}):Promise<boolean>{
  let windowSec=Number(opts?.windowSec??process.env.RATE_LIMIT_WINDOW_SEC??60);
  let max=Number(opts?.max??process.env.RATE_LIMIT_MAX??100);
  let useFile=false;

  if(process.env.NODE_ENV!=="production"){
    const hdrMax=Number(req.headers["x-rl-max"]||"");
    const hdrWin=Number(req.headers["x-rl-window"]||"");
    const bypass=String(req.headers["x-rl-bypass"]||"").toLowerCase()==="1";
    if(bypass){res.setHeader("X-RateLimit-Bypass","true");return true;}
    if(Number.isFinite(hdrMax)&&hdrMax>0)max=hdrMax;
    if(Number.isFinite(hdrWin)&&hdrWin>0)windowSec=hdrWin;
    if((hdrMax&&hdrMax>0)||(hdrWin&&hdrWin>0))useFile=true;
  }

  const route=req.url?.split("?")[0]||"unknown";
  const ip=clientIp(req); const tenant=(req.headers["x-tenant-id"] as string)||null;
  const key=buildKey({ ip, route, tenant });

  let current=await redisCount(key,windowSec);
  if(current===null) current=useFile?fileCount(key,windowSec):memCount(key,windowSec);

  try { metrics.rlHits.inc({ route, tenant: String(tenant||"anon") }); } catch {}
  try { metrics.rlCurrent.set({ route, tenant: String(tenant||"anon") }, Number(current||0)); } catch {}

  if(current>max){
    res.setHeader("Retry-After", String(Math.ceil(windowSec)));
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", "0");
    res.status(429).json({ error: "rate_limited", message: "Too many requests. Please try again shortly." });
    try { metrics.rlBlocked.inc({ route, tenant: String(tenant||"anon") }); } catch {}
    auditLog({ type:"rate_limit", route, ip, tenant, status:429, count: current, max, windowSec });
    return false;
  }
  res.setHeader("X-RateLimit-Limit", String(max));
  res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - current)));
  return true;
}
