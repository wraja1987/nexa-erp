import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/src/lib/prisma";
import { v4 as uuid } from "uuid";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const tag = String(req.query.tag || "misc");
      const rows = await prisma.kpiSnapshot.findMany({
        where: { name: { startsWith: tag } },
        orderBy: { asOf: "desc" },
        take: 50,
      } as any);
      res.status(200).json({ items: rows.map(r => ({ id: r.id, name: r.name, value: Number(r.value), asOf: r.asOf })) });
      return;
    }
    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const created = await prisma.kpiSnapshot.create({ data: { id: uuid(), tenantId: "tenant-nexa" as any, name: String(body.name), value: body.value ?? 0, asOf: new Date() } } as any);
      res.status(201).json({ ok: true, id: created.id });
      return;
    }
    if (req.method === "DELETE") {
      const id = String(req.query.id || "");
      if (!id) { res.status(422).json({ error: "id required" }); return; }
      await prisma.kpiSnapshot.delete({ where: { id } });
      res.status(204).end();
      return;
    }
    res.setHeader("Allow", "GET, POST, DELETE");
    res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Server error" });
  }
}


