import fs from "fs";
import path from "path";

const roots = ["public", "public/images", "public/assets", "public/website"];
const exts = new Set([".png",".jpg",".jpeg"]);
const THRESH = parseInt(process.env.IMAGE_MAX || "300000",10); // 300 kB default

function* walk(d){
  if (!fs.existsSync(d)) return;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const pth = path.join(d, e.name);
    if (e.isDirectory()) yield* walk(pth);
    else if (exts.has(path.extname(e.name).toLowerCase())) yield pth;
  }
}

const findings = [];
for (const r of roots) {
  for (const f of walk(r)) {
    const st = fs.statSync(f);
    if (st.size > THRESH) {
      const dir = path.dirname(f);
      const base = path.basename(f, path.extname(f));
      const hasWebp = fs.existsSync(path.join(dir, base + ".webp"));
      const hasAvif = fs.existsSync(path.join(dir, base + ".avif"));
      findings.push({ file:f, bytes:st.size, hasWebp, hasAvif });
    }
  }
}
if (findings.length === 0) {
  console.log("✅ No oversized PNG/JPEG images over", THRESH, "bytes.");
  process.exit(0);
}
console.log("⚠️ Oversized images (suggest WebP/AVIF):");
for (const x of findings) {
  const kb = Math.round(x.bytes/102.4)/10;
  console.log(`- ${x.file}  (${kb} kB)  webp:${x.hasWebp?"yes":"no"}  avif:${x.hasAvif?"yes":"no"}`);
}
process.exit( findings.length ? 1 : 0 );


