import fs from "fs";
import path from "path";
import sharp from "sharp";

const roots = [
  "public",
  "public/images",
  "public/assets",
  "public/website",
];

const exts = new Set([".png", ".jpg", ".jpeg"]);
const maxW = 1920; // cap width for heavy assets

async function convert(file) {
  const dir = path.dirname(file);
  const base = path.basename(file, path.extname(file));
  const webp = path.join(dir, base + ".webp");
  const avif = path.join(dir, base + ".avif");
  try {
    const img = sharp(file).resize({ width: maxW, withoutEnlargement: true });
    if (!fs.existsSync(webp)) {
      await img.clone().webp({ quality: 82 }).toFile(webp);
      console.log("webp:", webp);
    }
    if (!fs.existsSync(avif)) {
      await img.clone().avif({ quality: 50 }).toFile(avif);
      console.log("avif:", avif);
    }
  } catch (e) {
    console.error("skip:", file, e.message);
  }
}

function* walk(d) {
  if (!fs.existsSync(d)) return;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (exts.has(path.extname(e.name).toLowerCase())) yield p;
  }
}

for (const r of roots) for (const file of walk(r)) await convert(file);





