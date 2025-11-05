/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const appDir = path.join(repoRoot, "apps", "web", "app");
const authSeg = path.join(appDir, "(app)");
const scriptsDir = path.join(repoRoot, "apps", "web", "scripts");
const manifestPath = path.join(scriptsDir, "route-manifest.json");

type Mod = { id: string; path: string; children?: { id: string; path: string }[] };
type Manifest = { modules: Mod[] };

function titleCase(slug: string) {
  return slug
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function writeIfMissing(filePath: string, content: string) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, "utf8");
    return "created";
  }
  return "skipped";
}

function pageFor(pathParts: string[], title: string, subtitle: string, breadcrumbs: {label: string; href: string}[], childrenLinks: {label: string; href: string}[] = []) {
  const linksBlock = childrenLinks.length
    ? `
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        ${childrenLinks
          .map(
            (l) => `
        <a href="${l.href}" className="block rounded-md border bg-card p-5 shadow-sm hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary">
          <h3 className="font-semibold text-foreground mb-1">${l.label}</h3>
          <p className="text-sm text-muted-foreground">Open ${l.label}.</p>
        </a>`
          )
          .join("\n")}
      </div>`
    : `
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">This is the Nexa ${title} workspace.</p>
      </div>`;

  return `"use client";

import NexaShell from "@/components/shells/nexa-shell";

export default function Page() {
  return (
    <NexaShell
      title="${title}"
      subtitle="${subtitle}"
      breadcrumbs={[${breadcrumbs.map((b) => `{ label: "${b.label}", href: "${b.href}" }`).join(", ")}]}>
      ${linksBlock}
    </NexaShell>
  );
}
`;
}

function main() {
  if (!fs.existsSync(manifestPath)) {
    console.error("ERROR: Missing manifest at", manifestPath);
    process.exit(1);
  }
  if (!fs.existsSync(authSeg)) {
    console.error("ERROR: Missing authenticated segment at", authSeg);
    process.exit(1);
  }
  const raw = fs.readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(raw) as Manifest;

  const results: string[] = [];

  for (const mod of manifest.modules) {
    const modRel = mod.path.replace(/^\//, "");
    const modDir = path.join(authSeg, modRel);
    const modPage = path.join(modDir, "page.tsx");

    // Module root: children links if present
    ensureDir(modDir);
    const modTitle = titleCase(mod.id);
    const modChildren = (mod.children ?? []).map((c) => ({
      label: titleCase(c.id),
      href: c.path,
    }));
    const modBreadcrumbs = [{ label: modTitle, href: mod.path }];
    const modSubtitle = `Central hub for ${modTitle.toLowerCase()}.`;

    const modStatus = writeIfMissing(modPage, pageFor(modRel.split("/"), modTitle, modSubtitle, modBreadcrumbs, modChildren));
    results.push(`${modStatus}: ${path.relative(repoRoot, modPage)}`);

    // Children
    for (const c of mod.children ?? []) {
      const childRel = c.path.replace(/^\//, "");
      const childDir = path.join(authSeg, childRel);
      const childPage = path.join(childDir, "page.tsx");
      ensureDir(childDir);

      const childTitle = `${modTitle} — ${titleCase(c.id)}`;
      const childSubtitle = `Manage ${titleCase(c.id).toLowerCase()}.`;
      const childBreadcrumbs = [
        { label: modTitle, href: mod.path },
        { label: titleCase(c.id), href: c.path },
      ];

      const childStatus = writeIfMissing(childPage, pageFor(childRel.split("/"), childTitle, childSubtitle, childBreadcrumbs));
      results.push(`${childStatus}: ${path.relative(repoRoot, childPage)}`);
    }
  }

  // Summary
  console.log("ROUTE GENERATION SUMMARY:");
  for (const r of results) console.log(" -", r);
}

main();







