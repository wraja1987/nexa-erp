import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nexa ERP",
  description: "Sign in to Nexa ERP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


