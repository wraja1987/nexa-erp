import "../../styles/globals.css";
import dynamic from "next/dynamic";

// Use the approved shell with sidebar, topbar, and AI Engine bar
const Shell = dynamic(() => import("../../components/layout/Shell"), { ssr: false });

export const metadata = { title: "Nexa ERP" };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}


