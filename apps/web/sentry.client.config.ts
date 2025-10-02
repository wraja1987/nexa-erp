import * as Sentry from "@sentry/nextjs";
import { scrubEvent } from "./src/lib/sentry-scrub";

Sentry.init({
  dsn: process.env.SENTRY_DSN || undefined,
  environment: process.env.SENTRY_ENV || "production",
  release: process.env.SENTRY_RELEASE || undefined,
  // Errors: capture all on client
  sampleRate: 1.0,
  // Traces: keep sensible budget
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.15),
  // Frontend profiling off by default; enable if needed
  profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE ?? 0.0),
  sendDefaultPii: false,
  beforeSend(event) {
    return scrubEvent(event);
  },
});
