import type { AppProps } from "next/app";
import "@/app/globals.css";
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider basePath="/api/auth" session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

