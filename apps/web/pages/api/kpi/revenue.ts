import type { NextApiRequest, NextApiResponse } from "next";
import { pg } from "../../../lib/db/pg";
import { RangeQ } from "../../../lib/validation/kpi";
import { getJSON, setJSON } from "../../../lib/cache/tags";
const KPI_TTL = Number(process.env.KPI_TTL_SEC || 300);
export default async function handler(req: NextApiRequest, res: NextApiResponse){
  try{
    const parsed=RangeQ.safeParse(req.query);
    if (!parsed.success){ res.status(422).json({ok:false,error:{code:"VALIDATION",details:parsed.error.flatten()}}); return; }
    const { from, to } = parsed.data;
    const key = `kpi:revenue:${from||"min"}:${to||"max"}`;
    const cached=await getJSON<any>(key);
    if (cached){ res.setHeader("Cache-Control",`s-maxage=${KPI_TTL}, stale-while-revalidate=${KPI_TTL*5}`); res.status(200).json(cached); return; }
    const sql = `SELECT COALESCE(SUM(total),0)::numeric AS revenue FROM "Invoice" WHERE status IN ('POSTED','PAID')`;
    const { rows } = await pg.query(sql);
    const result = { ok:true, revenue: Number(rows[0]?.revenue ?? 0) };
    await setJSON(key, result, KPI_TTL, ["kpi:revenue"]);
    res.setHeader("Cache-Control",`s-maxage=${KPI_TTL}, stale-while-revalidate=${KPI_TTL*5}`);
    res.status(200).json(result);
  }catch(err){
    console.error("kpi/revenue error:", err);
    res.status(500).json({ ok:false, error:"KPI_REVENUE_ERROR" });
  }
}
