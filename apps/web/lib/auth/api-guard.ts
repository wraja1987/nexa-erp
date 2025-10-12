import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function requireApiAuth(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as any);
  if (!session) {
    res.status(401).json({ error: "Unauthenticated" });
    return null;
  }
  return session;
}

export async function requireAuth<T>(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<T>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions as any);
    if (!session) return res.status(401).json({ error: "Unauthenticated" }) as any;
    return handler(req, res);
  };
}

export default requireAuth;
