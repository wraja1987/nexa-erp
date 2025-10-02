"use client";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void; }) {
  // Sentry will auto-capture via error boundary
  return (
    <html lang="en-GB">
      <body>
        <Sentry.ErrorBoundary fallback={<div>Something went wrong</div>}>
          <div style={{padding:16}}>
            <h1>Something went wrong</h1>
            <p>We have been notified. You can try again.</p>
            <button onClick={reset}>Try again</button>
          </div>
        </Sentry.ErrorBoundary>
      </body>
    </html>
  );
}
