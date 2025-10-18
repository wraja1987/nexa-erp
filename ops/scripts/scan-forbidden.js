#!/usr/bin/env node
const { execSync } = require("node:child_process");

const forbid = ["PLACEHOLDER","TODO UI","LOREM","COMING SOON","TBD"];
const excludeDirs = [".git","node_modules",".next","dist","build"];
const excludeFiles = ["pnpm-lock.yaml","package-lock.json","yarn.lock","ops/scripts/scan-forbidden.js"];

function grep(token){
  const parts = ["grep","-RIn","--color=never"];
  excludeDirs.forEach(d=>parts.push(`--exclude-dir=${d}`));
  excludeFiles.forEach(f=>parts.push(`--exclude=${f}`));
  parts.push(`-e`, token, ".");
  try{
    return execSync(parts.join(" "), { stdio:["ignore","pipe","ignore"] }).toString().trim();
  }catch{ return ""; }
}

let failed = false;
for (const t of forbid){
  const out = grep(t);
  const filtered = out
    .split("\n")
    .filter(line => line && !line.includes("ops/scripts/scan-forbidden.js"))
    .join("\n")
    .trim();
  if (filtered){
    console.error(`Forbidden string found: "${t}"\n${filtered}\n`);
    failed = true;
  }
}
if (failed) process.exit(1);


