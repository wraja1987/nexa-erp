import type { NextApiRequest, NextApiResponse } from "next";
import { pg } from "../../../lib/db/pg";
import { InvoicesQ } from "../../../lib/validation/kpi";
import { getJSON, setJSON } from "../../../lib/cache/tags";
const KPI_TTL = Number(process.env.KPI_TTL_SEC || 120);
export default async function handler(req: NextApiRequest, res: NextApiResponse){
  try{
    const parsed=InvoicesQ.safeParse(req.query);
    if (!parsed.success){ res.status(422).json({ok:false,error:{code:"VALIDATION",details:parsed.error.flatten()}}); return; }
    const { status, limit, offset } = parsed.data;
    const key = `kpi:invoices:${status||"ALL"}:${limit}:${offset}`;
    const cached=await getJSON<any>(key);
    if (cached){ res.setHeader("Cache-Control",`s-maxage=${KPI_TTL}, stale-while-revalidate=${KPI_TTL*5}`); res.status(200).json(cached); return; }
    const countsSql = `SELECT status, COUNT(*)::int AS count FROM "Invoice" GROUP BY status`;
    const where = status? `WHERE status=$1` : "";
    const listSql = `SELECT id, code, "customerId", currency, status, total, "createdAt" FROM "Invoice" ${where} ORDER BY "createdAt" DESC LIMIT ${limit} OFFSET ${offset}`;
    const counts = (await pg.query(countsSql)).rows;
    const list = (await pg.query(listSql, status?[status]:[])).rows;
    const result = { ok:true, counts, list, limit, offset, nextOffset: list.length === limit ? offset + limit : null };
    await setJSON(key, result, KPI_TTL, ["kpi:invoices"]);
    res.setHeader("Cache-Control",`s-maxage=${KPI_TTL}, stale-while-revalidate=${KPI_TTL*5}`);
    res.status(200).json(result);
  }catch(err){
    console.error("kpi/invoices error:", err);
    res.status(500).json({ ok:false, error:"KPI_INVOICES_ERROR" });
  }
}
