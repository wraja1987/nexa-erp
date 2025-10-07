import type { NextApiRequest, NextApiResponse } from "next";

export function safe(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void|unknown>|void
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error("[api-safe]", err);
      if (!res.headersSent) {
        res.status(200).json({ ok: false, error: "temporary_unavailable" });
      }
    }
  };
}
