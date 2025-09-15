import { createReadStream } from "fs";
import * as readline from "readline";

(async () => {
  const stream = createReadStream("reports/audit.jsonl", { flags: "a+" });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.trim()) continue;
    try { console.log(JSON.parse(line)); } catch { console.log(line); }
  }
})();




