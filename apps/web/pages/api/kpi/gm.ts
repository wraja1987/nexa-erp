import type { NextApiRequest, NextApiResponse } from "next";
import { RangeQ } from "../../../lib/validation/kpi";
import { getJSON, setJSON } from "../../../lib/cache/tags";
const KPI_TTL = Number(process.env.KPI_TTL_SEC || 300);
export default async function handler(req: NextApiRequest, res: NextApiResponse){
  try{
    const parsed=RangeQ.safeParse(req.query);
    if (!parsed.success){ res.status(422).json({ok:false,error:{code:"VALIDATION",details:parsed.error.flatten()}}); return; }
    const { from, to } = parsed.data;
    const key = `kpi:gm:${from||"min"}:${to||"max"}`;
    const cached=await getJSON<any>(key);
    if (cached){ res.setHeader("Cache-Control",`s-maxage=${KPI_TTL}, stale-while-revalidate=${KPI_TTL*5}`); res.status(200).json(cached); return; }
    // Placeholder until COGS exists; if KPI_COGS_ENABLED=1 and cost column exists, try real calc
    let result: any;
    if (process.env.KPI_COGS_ENABLED === "1") {
      try {
        // Attempt: revenue as sum(total) over POSTED/PAID; cogs approximated via InvoiceLine.cost if present
        // This query will fail if cost column does not exist; we catch and fallback
        // NOTE: Adjust to your real schema when COGS is available
        const revenueRes = await (await import("../../../lib/db/pg")).pg.query(
          `SELECT COALESCE(SUM(total),0)::numeric AS revenue FROM "Invoice" WHERE status IN ('POSTED','PAID')`
        );
        const revenue = Number(revenueRes.rows[0]?.revenue ?? 0);
        const cogsRes = await (await import("../../../lib/db/pg")).pg.query(
          `SELECT COALESCE(SUM(cost*qty),0)::numeric AS cogs FROM "InvoiceLine"`
        );
        const cogs = Number(cogsRes.rows[0]?.cogs ?? 0);
        const gm = revenue - cogs;
        const gmPct = revenue > 0 ? (gm / revenue) * 100 : 0;
        result = { ok:true, grossMargin: Number(gm.toFixed(2)), grossMarginPct: Number(gmPct.toFixed(2)), net: 0 };
      } catch {
        result = { ok:true, grossMargin: null as number | null, grossMarginPct: null as number | null, net: 0 };
      }
    } else {
      result = { ok:true, grossMargin: null as number | null, grossMarginPct: null as number | null, net: 0 };
    }
    await setJSON(key, result, KPI_TTL, ["kpi:gm"]);
    res.setHeader("Cache-Control",`s-maxage=${KPI_TTL}, stale-while-revalidate=${KPI_TTL*5}`);
    res.status(200).json(result);
  }catch(err){
    console.error("kpi/gm error:", err);
    res.status(500).json({ ok:false, error:"KPI_GM_ERROR" });
  }
}
