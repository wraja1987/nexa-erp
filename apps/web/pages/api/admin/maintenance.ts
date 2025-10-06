import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace("Bearer ", "") ?? "";
  if (token !== (process.env.ADMIN_MAINT_TOKEN || "")) {
    return res.status(401).json({ error: "unauthorised" });
  }
  if (req.method !== "GET") {
    return res.status(405).json({ error: "read-only" });
  }

  return res.status(200).json({
    mode: process.env.MAINTENANCE_MODE ?? "false",
    message: process.env.MAINTENANCE_MESSAGE ?? "",
    start: process.env.MAINTENANCE_START_ISO ?? "",
    end: process.env.MAINTENANCE_END_ISO ?? "",
  });
}
