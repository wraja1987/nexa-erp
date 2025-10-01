const fs = require("fs");
const path = require("path");
async function main() {
  const treePath = path.join(process.cwd(), "public", "modules", "_tree.json");
  if (!fs.existsSync(treePath)) { console.log("No _tree.json found; skip"); return; }
  const tree = JSON.parse(fs.readFileSync(treePath, "utf8"));
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();
  async function upsert(node, parentId) {
    const slug = (node.id || node.name || "").toString().toLowerCase().replace(/\s+/g, "-");
    const sortKey = (node.name || "").toString();
    const rec = await prisma.moduleNode.upsert({
      where: { slug },
      create: { slug, name: node.name, path: node.path || "", parentId, icon: node.icon || null, status: node.meta?.status || null, sortKey },
      update: { name: node.name, path: node.path || "", parentId, icon: node.icon || null, status: node.meta?.status || null, sortKey }
    });
    for (const c of (node.children || [])) await upsert(c, rec.id);
  }
  for (const n of tree) await upsert(n, null);
  console.log("Modules snapshot complete");
}
main().catch(e => { console.error(e); process.exit(1); });
