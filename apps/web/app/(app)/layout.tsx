import "../../styles/globals.css";
// Use the approved shell with sidebar, topbar, and AI Engine bar
import Shell from "../../components/layout/Shell";

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


