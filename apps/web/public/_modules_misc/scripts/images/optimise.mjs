import fs from 'fs'; import path from 'path'; import sharp from 'sharp';
const root = path.resolve('apps/web/public/website'); const exts = ['.png','.jpg','.jpeg']; const files=[];
(function walk(d){ for(const n of fs.readdirSync(d)){ const p=path.join(d,n); const s=fs.statSync(p); if(s.isDirectory()) walk(p); else if(exts.includes(path.extname(n).toLowerCase())) files.push(p); } })(root);
for (const f of files){ const buf = fs.readFileSync(f);
  await sharp(buf).webp({quality:82}).toFile(f.replace(/\.(png|jpe?g)$/i,'.webp'));
  await sharp(buf).avif({quality:50}).toFile(f.replace(/\.(png|jpe?g)$/i,'.avif'));
}
console.log('Optimised', files.length, 'images to WebP/AVIF');
