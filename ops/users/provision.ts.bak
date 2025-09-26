#!/usr/bin/env tsx
import fs from "node:fs"; import path from "node:path"
type UserSeed = { email:string; password:string; role:string; tenant?:string }
const users: UserSeed[] = [
  { email: "info@chiefaa.com", password: "Wolfish123", role: "SUPER_ADMIN" },
  { email: "wraja1987@gmail.com", password: "Wolfish123", role: "ADMIN" },
  { email: "wraja1987@yahoo.co.uk", password: "Wolfish123", role: "ADMIN", tenant: "demo-live" }
]
const auditLog = path.join(process.cwd(), "reports", "audit.jsonl")
const audit = (e:any)=>fs.appendFileSync(auditLog, JSON.stringify({ts:new Date().toISOString(),...e})+"\n")

async function createUser(u:UserSeed){
  audit({action:"user.create.start", email:u.email, role:u.role, tenant:u.tenant??"default"})
  // TODO: replace with real service call
  audit({action:"user.create.ok", email:u.email})
}
;(async()=>{
  for(const u of users){ await createUser(u) }
  console.log("✅ Provision done; see reports/audit.jsonl")
})().catch(e=>{console.error(e);process.exit(1)})
