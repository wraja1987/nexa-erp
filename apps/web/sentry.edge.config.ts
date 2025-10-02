import * as Sentry from "@sentry/nextjs";
Sentry.init({
  dsn: process.env.SENTRY_DSN || undefined,
  environment: process.env.SENTRY_ENV || "production",
  release: process.env.SENTRY_RELEASE || undefined,
  sampleRate: 1.0,
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.10),
  sendDefaultPii: false,
});
