import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <div className="min-h-screen bg-slate-50">
          <aside data-testid="layout-sidebar" className="fixed left-0 top-0 h-full w-64 bg-[#0D42FF] text-white p-4 hidden md:block">NEXA</aside>
          <main className="md:ml-64">
            <header data-testid="layout-topbar" className="h-14 bg-white border-b px-4 flex items-center justify-between">Topbar</header>
            <div className="p-6">{children}</div>
            <footer data-testid="ai-engine-bar" className="fixed right-6 bottom-6">AI</footer>
          </main>
        </div>
      </body>
    </html>
  );
}
