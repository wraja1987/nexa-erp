#!/usr/bin/env ts-node
import { existsSync } from "fs";
import { join } from "path";

const web = join(process.cwd(), "apps/web");

function norm(p: string) { return p.replace(/^\/+/, ""); }

function has(p: string) {
  const rel = norm(p);
  return (
    existsSync(join(web, "app", rel, "page.tsx")) ||
    existsSync(join(web, "pages", rel + ".tsx")) ||
    existsSync(join(web, "pages", rel, "index.tsx"))
  );
}

const top = ["/login","/dashboard","/finance","/inventory","/manufacturing","/sales","/projects","/hr","/pos","/ai"];

const subs: Record<string,string[]> = {
  "/finance": ["invoices","bills","payments","banking","reports"],
  "/inventory": ["items","warehouses","stock-moves","purchase-orders","reports"],
  "/manufacturing": ["bom","work-orders","scheduling","reports"],
  "/sales": ["leads","opportunities","quotes","orders","customers","reports"],
  "/projects": ["boards","tasks","time","billing","reports"],
  "/hr": ["employees","payroll","leave","attendance","reports"],
  "/pos": ["register","sessions","receipts","reports"],
  "/ai": ["playbooks","documents","insights","settings"]
};

let fail = false;

for (const r of top) if (!has(r)) { console.error(`Missing route: ${r}`); fail = true; }
for (const [base, children] of Object.entries(subs)) {
  for (const c of children) {
    const p = `${base}/${c}`;
    if (!has(p)) { console.error(`Missing sub-route: ${p}`); fail = true; }
  }
}

if (fail) process.exit(1);
console.log("Route inventory OK");


