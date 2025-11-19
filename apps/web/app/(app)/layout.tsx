import "../../styles/globals.css";
import AppShell from "@/components/layout/AppShell";

export const metadata = { title: "Nexa ERP" };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}


