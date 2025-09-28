import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

type Mod = { id: string; title: string; order: number; path: string };
type Tree = Mod & { children?: Mod[] };

const pretty = (slug: string) =>
  slug
    .split("-")
    .map(s => (s ? s[0].toUpperCase() + s.slice(1) : s))
    .join(" ");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // locate modules dir (monorepo-safe)
    const dirA = path.join(process.cwd() || "", "apps", "web", "public", "modules");
    const dirB = path.join(process.cwd() || "", "public", "modules");
    const modulesDir = fs.existsSync(dirA) ? dirA : (fs.existsSync(dirB) ? dirB : "");
    if (!modulesDir) return res.status(200).json([]);

    // read all *.json
    const files = fs.readdirSync(modulesDir).filter(f => f.endsWith(".json"));

    // collect flat list
    const flat: Mod[] = [];
    for (const f of files) {
      const id = f.replace(/\.json$/i, "");
      const full = path.join(modulesDir, f);
      try {
        const raw = fs.readFileSync(full, "utf-8");
        const data = JSON.parse(raw) ?? {};
        // title fallback: last segment after dot, prettified
        const lastSeg = id.includes(".") ? id.split(".").slice(-1)[0] : id;
        const title: string = (data.title as string) || pretty(lastSeg);
        const order: number = Number.isFinite(data.order) ? Number(data.order) : 9999;
        flat.push({ id, title, order, path: `/modules/${id}` });
      } catch {
        // tolerate malformed files
        const lastSeg = id.includes(".") ? id.split(".").slice(-1)[0] : id;
        flat.push({ id, title: pretty(lastSeg), order: 9999, path: `/modules/${id}` });
      }
    }

    // alphabetical title sort as baseline
    flat.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));

    // flat mode
    if ("flat" in req.query) {
      return res.status(200).json(flat);
    }

    // build parent -> children
    const parentMap = new Map<string, Mod>();     // parents to expose
    const childMap = new Map<string, Mod[]>();    // parentId -> children

    for (const m of flat) {
      const parentId = m.id.includes(".") ? m.id.split(".")[0] : m.id;
      const isChild = m.id.includes(".");
      if (!isChild) {
        // ensure parent exists
        parentMap.set(m.id, { ...m, path: `/modules/${m.id}` });
      } else {
        if (!childMap.has(parentId)) childMap.set(parentId, []);
        childMap.get(parentId)!.push(m);
      }
    }

    // if a parent has no explicit JSON, synthesise a minimal parent entry
    for (const [pid, kids] of childMap.entries()) {
      if (!parentMap.has(pid)) {
        parentMap.set(pid, {
          id: pid,
          title: pretty(pid),
          order: 9999,
          path: `/modules/${pid}`,
        });
      }
      // sort children alphabetically by title
      kids.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
    }

    // assemble tree and sort parents by title
    const tree: Tree[] = Array.from(parentMap.values())
      .map(p => ({ ...p, children: childMap.get(p.id) || [] }))
      .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));

    return res.status(200).json(tree);
  } catch (e) {
    return res.status(200).json([]);
  }
}
