import type { NextApiRequest, NextApiResponse } from "next";
import { invalidateTags } from "../../../lib/cache/tags";
export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method!=="POST"){ res.status(405).end(); return; }
  const tags = Array.isArray(req.body?.tags) ? req.body.tags : [];
  await invalidateTags(tags);
  res.status(200).json({ ok:true, invalidated: tags.length });
}
