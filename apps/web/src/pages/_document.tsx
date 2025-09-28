/* Minimal Document to placate legacy export; App Router remains primary. */
/* eslint-disable @next/next/no-document-import-in-page */
import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en-GB">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
