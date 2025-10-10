import { chromium } from 'playwright';
import fs from 'fs';
const base=(process.env.BASE_URL||'').replace(/\/$/,'');
const out=process.env.OUT_DIR||'.';
if(!base){ console.error('BASE_URL missing'); process.exit(2); }
async function snap(path,name){
  const browser=await chromium.launch();
  const ctx=await browser.newContext();
  const page=await ctx.newPage();
  const resp=await page.goto(base+path,{waitUntil:'networkidle',timeout:120000});
  await page.screenshot({path:`${out}/${name}.png`,fullPage:true});
  let headers={};
  if(resp){ try{ for(const [k,v] of resp.headersArray()) headers[k]=v; } catch{ headers = await resp.allHeaders(); } }
  fs.writeFileSync(`${out}/${name}.headers.json`, JSON.stringify(headers,null,2));
  await browser.close();
  return resp ? resp.status() : 0;
}
const root=await snap('/', 'root');
const login=await snap('/login','login');
console.log(JSON.stringify({root,login},null,2));
