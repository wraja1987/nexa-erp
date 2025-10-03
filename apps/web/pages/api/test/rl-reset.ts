import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs"; import path from "path";
export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV === "production") { res.status(404).end(); return; }
  const root = process.env.PROJECT_ROOT || process.cwd();
  try { fs.rmSync(path.join(root, ".next", "rl-test"), { recursive: true, force: true }); } catch {}
  try { (globalThis as any).__NEXA_RL_MEM = new Map(); } catch {}
  try { (globalThis as any).__NEXA_IDEM_MEM = new Map(); } catch {}
  res.status(200).json({ ok: true, cleared: true });
}
