#!/usr/bin/env node
import http from 'node:http';

function fetchJson(url){
  return new Promise((resolve,reject)=>{
    const req=http.get(url,(res)=>{
      let data='';
      res.on('data',c=>data+=c);
      res.on('end',()=>{ try{ resolve(JSON.parse(data)); } catch(e){ reject(e); } });
    });
    req.on('error',reject);
  });
}

const URL = process.env.MODULES_URL || 'http://localhost:3000/api/modules?tree=1';
const EXPECTED_GROUPS = 17;

try{
  const data = await fetchJson(URL);
  if(!Array.isArray(data)) throw new Error('modules API did not return an array');
  const groups = [...new Set(data.map(x=>String(x.name||'').split('.')[0]).filter(Boolean))];
  console.log('Top-level group count:', groups.length);
  console.log('Groups:', groups.sort().join(', '));
  if(groups.length !== EXPECTED_GROUPS){
    console.error(`Expected ${EXPECTED_GROUPS} groups, got ${groups.length}`);
    process.exit(1);
  }
  console.log('PASS: Modules shape matches expectations');
} catch (e){
  console.error('FAIL:', e.message);
  process.exit(1);
}
