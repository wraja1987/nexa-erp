import "../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nexa ERP" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-gray-50">{children}</body>
    </html>
  );
}


