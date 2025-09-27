import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";
import NexaLayout from "../components/NexaLayout";

export default function App({ Component, pageProps }: AppProps) {
  const { session, ...rest } = (pageProps as any) || {};
  return (
    <SessionProvider session={session}>
      <NexaLayout>
        <Component {...rest} />
      </NexaLayout>
    </SessionProvider>
  );
}


