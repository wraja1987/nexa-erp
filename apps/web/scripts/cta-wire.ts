import fs from "fs";
import path from "path";
const labelToAction: Record<string, string> = {
  "New Invoice": "invoice:new",
  "View Invoices": "invoice:list",
  "New Purchase Order": "po:new",
  "View Purchase Orders": "po:list",
  "New Sales Order": "so:new",
  "View Sales Orders": "so:list",
  "Add Product": "product:new",
  "View Products": "product:list",
  "New Project": "project:new",
  "View Projects": "project:list",
  "Add Employee": "employee:new",
  "View Employees": "employee:list",
};
const SRC = path.join(process.cwd(), "src", "app", "app");
let changed = 0, suggested = 0;
function walk(dir: string) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.isFile() && /\.(tsx|jsx|js)$/.test(e.name)) processFile(full);
  }
}
function processFile(file: string) {
  let s = fs.readFileSync(file, "utf8");
  const orig = s;
  for (const [label, action] of Object.entries(labelToAction)) {
    const re = new RegExp(`(<(button|a)[^>]*>\\s*)(${escapeRe(label)})(\\s*<\\/\\2>)`, "g");
    s = s.replace(re, (m, pre, tag, txt, post) => {
      const openTagRe = new RegExp(`<${tag}[^>]*>`);
      const openTag = m.match(openTagRe)?.[0] || "";
      if (/data-action=/.test(openTag)) return m;
      const injected = m.replace(new RegExp(`<${tag}([^>]*)>`), `<${tag}$1 data-action="${action}">`);
      changed++;
      return injected;
    });
  }
  if (s !== orig) { fs.writeFileSync(file, s); return; }
  const rough = ["Invoice", "Purchase", "Sales Order", "Product", "Project", "Employee"];
  for (const kw of rough) { if (s.includes(kw)) { suggested++; break; } }
}
function escapeRe(str: string) { return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
if (fs.existsSync(SRC)) walk(SRC);
console.log(JSON.stringify({ changed, suggested }, null, 2));
