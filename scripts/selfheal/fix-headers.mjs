import fs from "fs";
const candidates = [
  "apps/web/middleware.ts",
  "apps/web/middleware.js",
  "middleware.ts",
  "middleware.js",
];

const snippetTs = `import { NextResponse } from "next/server";
export const config = { matcher: ["/((?!_next|api/.*|.*\\\\..*).*)"] };
export function middleware() {
  const res = NextResponse.next();
  res.headers.set("Strict-Transport-Security","max-age=63072000; includeSubDomains; preload");
  res.headers.set("X-Content-Type-Options","nosniff");
  res.headers.set("X-Frame-Options","DENY");
  res.headers.set("Referrer-Policy","no-referrer");
  return res;
}
`;

let wrote = false;
for (const p of candidates) {
  if (fs.existsSync(p)) {
    const c = fs.readFileSync(p, "utf-8");
    if (!/Strict-Transport-Security/i.test(c)) {
      fs.writeFileSync(p, c.trimEnd() + "\n\n" + snippetTs);
      wrote = true;
    }
    break;
  }
}
if (!wrote) {
  const path = candidates[0];
  fs.mkdirSync(path.split("/").slice(0,-1).join("/"), { recursive: true });
  fs.writeFileSync(path, snippetTs);
  wrote = true;
}
console.log(wrote ? "headers:changed" : "headers:nochange");
