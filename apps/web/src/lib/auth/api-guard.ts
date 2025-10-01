import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

export function requireApiAuth(handler: Handler): Handler {
  return async (req, res) => {
    const session = await getServerSession(req, res, authOptions as any);
    if (!session) return res.status(401).json({ error: "Unauthorised" });
    return handler(req, res);
  };
}
