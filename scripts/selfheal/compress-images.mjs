import { globby } from "globby";
import fs from "fs";
import sharp from "sharp";

const MAX = 300 * 1024;
const patterns = [
  "apps/**/public/**/*.{png,jpg,jpeg,webp}",
  "assets/**/*.{png,jpg,jpeg,webp}",
  "public/**/*.{png,jpg,jpeg,webp}"
];

let changed = 0, scanned = 0;
const files = await globby(patterns, { gitignore: true });
for (const f of files) {
  try {
    const buf = await fs.promises.readFile(f);
    scanned++;
    if (buf.byteLength <= MAX) continue;
    const ext = f.toLowerCase().split(".").pop();
    let out;
    if (ext === "png") {
      out = await sharp(buf).png({ palette: true }).toBuffer();
    } else {
      out = await sharp(buf).jpeg({ quality: 74, mozjpeg: true }).toBuffer();
    }
    if (out.byteLength < buf.byteLength) {
      await fs.promises.writeFile(f, out);
      changed++;
    }
  } catch {}
}
console.log(`images:scanned=${scanned} changed=${changed}`);
if (changed > 0 && process.env.GITHUB_OUTPUT) {
  await fs.promises.appendFile(process.env.GITHUB_OUTPUT, "image_changes=true\n");
}
