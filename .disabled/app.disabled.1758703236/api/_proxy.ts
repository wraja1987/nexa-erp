export const runtime = "nodejs";
const CORE = process.env.NEXA_CORE_API_URL ?? "http://localhost:4001";
function join(base: string, p: string){ const b = base.replace(/\/+$/,"" ); const q = p.replace(/^\/+/,""); return `${b}/${q}`; }
export async function proxyGET(req: Request, upstreamPath: string){
  const url = join(CORE, upstreamPath);
  try{
    const res = await fetch(url, { method: "GET", headers: { "accept":"application/json", "authorization": req.headers.get("authorization") ?? "" }, cache:"no-store" });
    const body = await res.text();
    return new Response(body, { status: res.status, headers: { "content-type": res.headers.get("content-type") ?? "application/json" }});
  }catch(e:any){ return new Response(JSON.stringify({ error:"Bad gateway", upstream: url, message: e?.message ?? "network error" }), { status:502, headers:{ "content-type":"application/json" }}); }
}
