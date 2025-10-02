// Nexa — Sentry instrumentation (Next.js)
import * as Sentry from "@sentry/nextjs";

export async function register() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN || "",
    tracesSampleRate: 0.1,
    enabled: process.env.NODE_ENV === "production",
  });
}
