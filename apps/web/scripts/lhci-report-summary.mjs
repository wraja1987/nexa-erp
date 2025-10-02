import fs from "fs";

const reportPath = ".lighthouseci/collect.json";
if (!fs.existsSync(reportPath)) {
  console.log("no summary");
  process.exit(0);
}

const runs = JSON.parse(fs.readFileSync(reportPath, "utf8"));
for (const run of runs || []) {
  if (!run || !run.summary) continue;
  const { performance, accessibility } = run.summary;
  const bestPractices = run.summary["best-practices"];
  const seo = run.summary.seo;
  console.log(`URL: ${run.url}\nPerf: ${performance}  A11y: ${accessibility}  BP: ${bestPractices}  SEO: ${seo}\n---`);
}

import fs from "fs";
const p = ".lighthouseci/collect.json";
if (!fs.existsSync(p)) { console.log("no summary"); process.exit(0); }
const arr = JSON.parse(fs.readFileSync(p, "utf8"));
for (const r of arr||[]) {
  if (!r?.summary) continue;
  const { performance, accessibility, "best-practices":bp, seo } = r.summary;
  console.log();
}
