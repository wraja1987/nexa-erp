// Tip: wrap handler with withSentry for richer traces
import { withSentry } from "@sentry/nextjs";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const mask = (s?: string | null) => {
    if (!s) return "";
    const head = s.slice(0, 6);
    const tail = s.slice(-6);
    return `${head}…${tail}`;
  };

  const id = process.env.GOOGLE_CLIENT_ID || "";
  const secret = process.env.GOOGLE_CLIENT_SECRET || "";
  const nextauthUrl = process.env.NEXTAUTH_URL || "";
  const trust = process.env.AUTH_TRUST_HOST || "";
  const debug = process.env.NEXTAUTH_DEBUG || "";

  res.status(200).json({
    GOOGLE_CLIENT_ID_present: Boolean(id),
    GOOGLE_CLIENT_ID_sample: mask(id),
    GOOGLE_CLIENT_SECRET_present: Boolean(secret),
    GOOGLE_CLIENT_SECRET_len: secret.length,
    NEXTAUTH_URL: nextauthUrl,
    AUTH_TRUST_HOST: trust,
    NEXTAUTH_DEBUG: debug,
    hint: "clientId/secret MUST be truthy; NEXTAUTH_URL must be http://localhost:3000 for local",
  });
}
