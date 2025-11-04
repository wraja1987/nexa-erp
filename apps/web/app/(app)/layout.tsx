import "../../styles/globals.css";
import { NexaAIBar } from "@/components/ai/nexa-ai-bar";

export const metadata = { title: "Nexa ERP" };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        <div className="min-h-screen">
          <main role="main">{children}</main>
        </div>
        <NexaAIBar />
      </body>
    </html>
  );
}


