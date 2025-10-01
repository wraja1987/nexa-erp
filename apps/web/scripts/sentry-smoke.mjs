import * as Sentry from '@sentry/node';
Sentry.init({ dsn: process.env.SENTRY_DSN || '', environment: process.env.SENTRY_ENVIRONMENT || 'local', tracesSampleRate: 0 });
Sentry.captureMessage('nexa_sentry_smoke_'+Date.now(), 'info');
console.log('sentry:queued');
