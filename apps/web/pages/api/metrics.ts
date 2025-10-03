import type { NextApiRequest, NextApiResponse } from "next";
import { registry } from "../../src/lib/metrics";
export const config = { api: { bodyParser: false } };
export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const reg = registry();
  res.setHeader("Content-Type", reg.contentType);
  res.status(200).send(await reg.metrics());
}
