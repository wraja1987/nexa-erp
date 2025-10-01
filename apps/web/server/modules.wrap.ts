import type { NextApiRequest, NextApiResponse } from "next";
import { makeEtag } from "./kpi.service";

export function sendWithEtag(res: NextApiResponse, body: any) {
  const etag = makeEtag(body);
  res.setHeader("ETag", etag);
  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  res.status(200).json(body);
}

export function maybeNotModified(req: NextApiRequest, res: NextApiResponse, body: any): boolean {
  const etag = makeEtag(body);
  if (req.headers["if-none-match"] === etag) { res.status(304).end(); return true; }
  res.setHeader("ETag", etag);
  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  return false;
}
