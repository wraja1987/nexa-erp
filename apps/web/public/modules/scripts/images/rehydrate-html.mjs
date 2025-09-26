import fs from 'fs'; import path from 'path'; import { JSDOM } from 'jsdom';
const root = path.resolve('apps/web/public/website');
function processHtml(file){
  const html = fs.readFileSync(file,'utf8'); const dom = new JSDOM(html); const doc = dom.window.document;
  doc.querySelectorAll('img').forEach(img=>{
    const src = img.getAttribute('src')||''; if(!/\.(png|jpe?g)$/i.test(src)) return;
    const webp=src.replace(/\.(png|jpe?g)$/i,'.webp'); const avif=src.replace(/\.(png|jpe?g)$/i,'.avif');
    const alt=img.getAttribute('alt')||''; const cls=img.getAttribute('class')||'';
    const pic=doc.createElement('picture');
    const s1=doc.createElement('source'); s1.setAttribute('srcset',avif); s1.setAttribute('type','image/avif');
    const s2=doc.createElement('source'); s2.setAttribute('srcset',webp); s2.setAttribute('type','image/webp');
    const im=doc.createElement('img'); im.setAttribute('src',src); im.setAttribute('alt',alt); if(cls) im.setAttribute('class',cls);
    pic.appendChild(s1); pic.appendChild(s2); pic.appendChild(im); img.replaceWith(pic);
  });
  fs.writeFileSync(file, dom.serialize(), 'utf8');
}
(function walk(d){ for(const n of fs.readdirSync(d)){ const p=path.join(d,n); const s=fs.statSync(p);
  if(s.isDirectory()) walk(p); else if(/\.(html?|htm)$/i.test(n)) processHtml(p);
}})(root);
console.log('Rewrote HTML <img> → <picture> where applicable');
