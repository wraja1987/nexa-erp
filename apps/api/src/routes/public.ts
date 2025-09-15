import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
// Using URL-based resolution to avoid __dirname in ESM

export type Sub = { slug: string; label: string };
export type Mod = { slug: string; label: string; subs: Sub[] };

const toSlug = (s: string) =>
  (s || "").trim().toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const cap = (s: string) =>
  (s || "").replace(/-/g, " ").replace(/\s+/g, " ").trim()
           .replace(/\b\w/g, (c) => c.toUpperCase())
           .replace(/\bAnd\b/g, "and").replace(/\bMtd\b/g, "MTD").replace(/\bFx\b/g, "FX");

// ESM-safe helper to resolve a path relative to this module
const thisDir = path.dirname(fileURLToPath(import.meta.url));

function loadModules(): Mod[] {
  try {
    const file = path.resolve(process.cwd(), "src/data/modules.json");
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    const list = Array.isArray((raw as any)?.modules) ? (raw as any).modules : [];
    return list.map((m: any) => ({
      slug: toSlug(m.name || m),
      label: cap(String(m.name || m || "")),
      subs: Array.isArray((raw as any)?.[String(m.name || m)])
        ? ((raw as any)[String(m.name || m)] as any[]).map((s: any) => ({
            slug: toSlug(String(s?.name || s)),
            label: cap(String(s?.name || s || "")),
          }))
        : [],
    }));
  } catch {
    return [];
  }
}

const router = Router();
console.log("[public] router initialized; cwd=", process.cwd());

router.get("/status", (_req, res) => {
  res.json({ ok: true, name: "Nexa ERP API", time: new Date().toISOString() });
});

router.get("/modules", (_req, res) => {
  const modules = loadModules();
  res.json({ modules });
});

router.get("/module/:module/:sub", (req, res) => {
  const modules = loadModules();
  const mod = modules.find((m) => m.slug === req.params.module);
  const sub = mod?.subs.find((s) => s.slug === req.params.sub);
  if (!mod || !sub) return res.status(404).json({ error: "Unknown module/sub" });

  res.json({
    module: { slug: mod.slug, label: mod.label },
    sub: { slug: sub.slug, label: sub.label },
    data: [],
    note: "Replace with real ERP data when implemented.",
  });
});

export default router;
