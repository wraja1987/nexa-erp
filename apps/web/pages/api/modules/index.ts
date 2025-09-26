import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

type ModuleItem = { id: string; title: string; path: string; icon?: string; order: number };

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const dir = path.join(process.cwd() || "", "apps", "web", "public", "modules");
    const altDir = path.join(process.cwd() || "", "public", "modules");
    let modulesDir = fs.existsSync(dir) ? dir : (fs.existsSync(altDir) ? altDir : '');
    if (!modulesDir) { res.status(200).json([{ id: 'dashboard', title: 'Dashboard', path: '/dashboard', order: 0 }]); return; }
    const files = fs.readdirSync(modulesDir).filter((f) => f.endsWith('.json'));
    const items: ModuleItem[] = [];
    for (const f of files) {
      try {
        const raw = fs.readFileSync(path.join(modulesDir, f), 'utf-8');
        const data = JSON.parse(raw);
        const id = f.replace(/\.json$/i, "");
        if (id === 'dashboard') continue;
        const title = data.title || id.replace(/[\.-]/g, ' ').replace(/\b\w/g, (m: string) => m.toUpperCase());
        const icon = data.icon || undefined;
        const order = Number.isFinite(data.order) ? Number(data.order) : 9999;
        items.push({ id, title, icon, order, path: `/modules/${id.split('.')[0]}` });
      } catch {}
    }
    items.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
    // Deduplicate by top-level id before first dot
    const seen = new Set<string>();
    const top: ModuleItem[] = [];
    for (const it of items) {
      const topId = it.id.split('.')[0];
      if (seen.has(topId)) continue;
      seen.add(topId);
      top.push({ ...it, id: topId, path: `/modules/${topId}` });
    }
    res.status(200).json([{ id: "dashboard", title: "Dashboard", path: "/dashboard", order: 0 }, ...top]);
  } catch (e) {
    res.status(200).json([{ id: 'dashboard', title: 'Dashboard', path: '/dashboard', order: 0 }]);
  }
}
