import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = (req.body || {}) as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    const passwordHash = (user as any)?.passwordHash as string | undefined;
    if (!user || !passwordHash) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if ((user as any).active === false) {
      return res.status(403).json({ error: "User is inactive" });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: (user as any).id,
        email: (user as any).email,
        name: (user as any).name,
        tenant_id: (user as any).tenant_id || null,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}




