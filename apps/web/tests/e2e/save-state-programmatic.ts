import { request } from "@playwright/test";
import fs from "node:fs";

async function main() {
  const baseURL = process.env.PW_BASE_URL || "http://localhost:3000";
  const email = process.env.NEXA_E2E_EMAIL;
  const password = process.env.NEXA_E2E_PASSWORD;
  if (!email || !password) throw new Error("Set NEXA_E2E_EMAIL and NEXA_E2E_PASSWORD.");

  const ctx = await request.newContext({ baseURL });

  const csrf = await ctx.get("/api/auth/csrf");
  if (!csrf.ok()) throw new Error(`/api/auth/csrf failed: ${csrf.status()}`);
  const { csrfToken } = await csrf.json();

  const body = new URLSearchParams();
  body.set("csrfToken", csrfToken);
  body.set("email", email);
  body.set("password", password);
  body.set("json", "true");

  const res = await ctx.post("/api/auth/callback/credentials", {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok()) throw new Error(`Login failed: ${res.status()} ${await res.text()}`);

  const out = "tests/e2e/.auth/state.json"; // relative to apps/web CWD
  fs.mkdirSync("tests/e2e/.auth", { recursive: true });
  await ctx.storageState({ path: out });
  console.log("Saved storageState to", out);

  const state = JSON.parse(fs.readFileSync(out, "utf8"));
  const names = (state.cookies || []).map((c: any) => c.name);
  console.log("Cookie names:", names);
  if (!names.some((n: string) => n.includes("next-auth"))) {
    throw new Error("No NextAuth session cookie in storageState. Are the creds valid for PW_BASE_URL?");
  }

  await ctx.dispose();
}
main().catch((e) => { console.error(e); process.exit(1); });





