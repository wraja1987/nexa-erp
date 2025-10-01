import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import tree from "../../public/modules/_tree.json";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const body = JSON.stringify(tree);
    const etag = `W/"${crypto.createHash("sha256").update(body).digest("base64")}"`;
    if (req.headers["if-none-match"] === etag) {
      res.status(304).end();
      return;
    }
    res.setHeader("ETag", etag);
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.status(200).json(JSON.parse(body));
  } catch (err) {
    // Simple server-side log; do not leak internals to client
    console.error("/api/modules error:", err);
    res.status(500).json({ ok: false, error: "MODULES_HANDLER_ERROR" });
  }
}
