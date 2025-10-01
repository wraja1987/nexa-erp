const fetch = (...a)=>import("node-fetch").then(({default: f})=>f(...a));
(async()=>{
  const base = process.env.BASE_URL || "http://localhost:3000";
  const j = async (p,h)=>{ const r=await fetch(base+p,{headers:h}); const t=await r.text(); let b; try{b=JSON.parse(t);}catch{b=t;} return {s:r.status,h:Object.fromEntries(r.headers.entries()),b}; };
  const m1 = await j("/api/modules?tree=1");
  const etag = m1.h.etag;
  const m2 = await j("/api/modules?tree=1", etag? {"If-None-Match": etag } : {});
  const rev = await j("/api/kpi/revenue");
  const gm  = await j("/api/kpi/gm");
  const inv = await j("/api/kpi/invoices?limit=5");
  const wip = await j("/api/kpi/wip");
  console.log(JSON.stringify({ modules:{first:m1.s, second:m2.s, etag}, revenue:rev.s, gm:gm.s, invoices:inv.s, wip:wip.s }, null, 2));
})();
