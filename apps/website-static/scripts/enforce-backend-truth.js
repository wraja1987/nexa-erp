const fs=require(fs);const path=require(path);const {setTimeout:delay}=require(timers/promises);
const API_BASE=process.env.API_BASE||https://api.nexaai.co.uk;
const APPLY=String(process.env.APPLY_CHANGES||true)===true;
const DATA_JSON=process.env.DATA_JSON;const REPORTS=process.env.REPORTS;
const now=()=>new Date().toISOString();
const read=p=>JSON.parse(fs.readFileSync(p,utf8));
const write=(p,o)=>fs.writeFileSync(p,JSON.stringify(o,null,2),utf8);
async function fetchJson(u,tries=2,toMS=4000){for(let i=0;i<tries;i++){const c=new AbortController();const t=setTimeout(()=>c.abort(),toMS);try{const r=await fetch(u,{signal:c.signal,headers:{Accept:application/json}});clearTimeout(t);if(!r.ok)throw new Error(HTTP