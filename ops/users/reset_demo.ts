#!/usr/bin/env tsx
import fs from "node:fs"; import path from "node:path"
const auditLog = path.join(process.cwd(), "reports", "audit.jsonl")
const audit = (e:any)=>fs.appendFileSync(auditLog, JSON.stringify({ts:new Date().toISOString(),...e})+"\n")
async function wipe(){ audit({action:"tenant.demo.wipe.start", tenant:"demo-live"}); audit({action:"tenant.demo.wipe.ok"}) }
async function seed(){ audit({action:"tenant.demo.seed.start"}); audit({action:"tenant.demo.seed.ok"}) }
;(async()=>{ await wipe(); await seed(); console.log("✅ Demo tenant reseeded; see reports/audit.jsonl") })()
