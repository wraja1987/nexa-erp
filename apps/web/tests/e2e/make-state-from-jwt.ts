import fs from "node:fs";
import { SignJWT } from "jose";
import { createSecretKey } from "crypto";

async function main() {
  const secret = process.env.NEXTAUTH_SECRET || "nexa-dev-secret";
  const baseURL = process.env.PW_BASE_URL || "http://localhost:3000";
  const email = process.env.E2E_USER_EMAIL || "super@nexa.ai";
  const name  = process.env.E2E_USER_NAME  || "Nexa Superuser";
  const sub   = process.env.E2E_USER_ID    || "e2e-user-1";

  const key = createSecretKey(Buffer.from(secret));
  const nowSec = Math.floor(Date.now() / 1000);
  const expSec = nowSec + 6 * 60 * 60; // 6 hours

  const payload = { name, email, sub, iat: nowSec, exp: expSec };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(nowSec)
    .setExpirationTime(expSec)
    .sign(key);

  const state = {
    cookies: [
      {
        name: "next-auth.session-token",
        value: token,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        expires: expSec, // seconds (Playwright requirement)
      },
    ],
    origins: [{ origin: baseURL, localStorage: [] }],
  } as any;

  fs.mkdirSync("tests/e2e/.auth", { recursive: true });
  fs.writeFileSync("tests/e2e/.auth/state.json", JSON.stringify(state, null, 2));
  console.log("Wrote tests/e2e/.auth/state.json with next-auth.session-token (exp in seconds)");
}
main().catch((e)=>{console.error(e);process.exit(1);});





