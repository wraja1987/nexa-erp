import base from "./playwright.config";
import type { FullConfig } from "@playwright/test";
import fs from "fs";

async function globalSetup(config: FullConfig) {
  const host = process.env.DEPLOYMENT_HOST!;
  const token = process.env.BYPASS_TOKEN!;
  if (!host || !token) throw new Error("Missing DEPLOYMENT_HOST or BYPASS_TOKEN");
  const state = {
    cookies: [
      {
        name: "__vercel_protection_bypass",
        value: token,
        domain: host,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
        expires: Math.floor(Date.now() / 1000) + 60 * 60 * 4,
      },
    ],
    origins: [],
  };
  fs.mkdirSync("tests/.auth", { recursive: true });
  fs.writeFileSync("tests/.auth/bypass.json", JSON.stringify(state));
}

const cfg = {
  ...base,
  use: {
    ...base.use,
    baseURL: `https://${process.env.DEPLOYMENT_HOST}`,
    storageState: "tests/.auth/bypass.json",
  },
  globalSetup,
};

export default cfg as any;

import base from "./playwright.config";
import type { FullConfig } from "@playwright/test";
import fs from "fs";
async function globalSetup(config: FullConfig) {
  const host = process.env.DEPLOYMENT_HOST!;
  const token = process.env.BYPASS_TOKEN!;
  const state = { cookies: [{ name: "__vercel_protection_bypass", value: token, domain: host, path: "/", httpOnly: true, secure: true, sameSite: "Lax", expires: Math.floor(Date.now()/1000)+14400 }], origins: [] };
  fs.mkdirSync("tests/.auth", { recursive: true });
  fs.writeFileSync("tests/.auth/bypass.json", JSON.stringify(state));
}
const cfg: any = { ...base, use: { ...base.use, baseURL: , storageState: "tests/.auth/bypass.json" }, globalSetup };
export default cfg;
