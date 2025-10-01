import type { NextApiRequest, NextApiResponse } from "next";
import { WipQ } from "../../../lib/validation/kpi";
import { getJSON, setJSON } from "../../../lib/cache/tags";
const KPI_TTL = Number(process.env.KPI_TTL_SEC || 300);
export default async function handler(req: NextApiRequest, res: NextApiResponse){
  try{
    const parsed=WipQ.safeParse(req.query);
    if (!parsed.success){ res.status(422).json({ok:false,error:{code:"VALIDATION",details:parsed.error.flatten()}}); return; }
    const { projectId, asOf } = parsed.data;
    const key = `kpi:wip:${projectId||"all"}:${asOf||"now"}`;
    const cached=await getJSON<any>(key);
    if (cached){ res.setHeader("Cache-Control",`s-maxage=${KPI_TTL}, stale-while-revalidate=${KPI_TTL*5}`); res.status(200).json(cached); return; }
    const result = { ok:true, asOf: (asOf? new Date(asOf): new Date()).toISOString(), projects: [] as any[] };
    await setJSON(key, result, KPI_TTL, ["kpi:wip"]);
    res.setHeader("Cache-Control",`s-maxage=${KPI_TTL}, stale-while-revalidate=${KPI_TTL*5}`);
    res.status(200).json(result);
  }catch(err){
    console.error("kpi/wip error:", err);
    res.status(500).json({ ok:false, error:"KPI_WIP_ERROR" });
  }
}
