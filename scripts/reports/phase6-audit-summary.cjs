#!/usr/bin/env node
const { execSync } = require("node:child_process");
function out(cmd){ try { return execSync(cmd, {stdio:"pipe"}).toString(); } catch(e){ return (e.stdout||"").toString() + (e.stderr||"").toString(); } }
let status = "FAIL";
const gate = out("node scripts/gates/phase6.cjs");
status = /(^|\n)PASS(\n|$)/.test(gate) ? "PASS" : "FAIL";
const ts = new Date().toISOString().replace(/[:-]/g,"").replace(/\..+/, "Z");
console.log();
