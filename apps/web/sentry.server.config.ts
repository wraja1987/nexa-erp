import * as Sentry from "@sentry/nextjs";
import { scrubEvent } from "./src/lib/sentry-scrub";

Sentry.init({
  dsn: process.env.SENTRY_DSN || undefined,
  environment: process.env.SENTRY_ENV || "production",
  release: process.env.SENTRY_RELEASE || undefined,
  // Errors: 100%
  sampleRate: 1.0,
  // Server traces sampling
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.20),
  // Node profiling can be helpful at low rate
  profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE ?? 0.05),
  sendDefaultPii: false,
  beforeSend(event) {
    return scrubEvent(event);
  },
});
