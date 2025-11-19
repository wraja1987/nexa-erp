"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ReactNode, useCallback, useState } from "react";
import { signOut } from "next-auth/react";
import { NAV_ITEMS } from "@/config/nav";
import { nexaTheme } from "@/styles/theme";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const isActive = useCallback((href: string) => pathname?.startsWith(href) ?? false, [pathname]);
  const toggle = useCallback((key: string) => setOpen((s) => ({ ...s, [key]: !s[key] })), []);

  return (
    <div className="flex min-h-screen" style={{ background: nexaTheme.colors.nexaBg, color: nexaTheme.colors.nexaText }}>
      {/* Sidebar */}
      <aside
        data-testid="layout-sidebar"
        className="w-72 shrink-0 text-white fixed left-0 top-0 bottom-0 overflow-y-auto"
        style={{ background: nexaTheme.colors.sidebarGradient }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-20 sticky top-0 bg-[#2E6BFF]/10 backdrop-blur-sm border-b border-white/10">
          <button
            aria-label="Nexa Logo - Click to logout"
            onClick={() => signOut({ callbackUrl: "https://www.nexaai.co.uk" })}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded"
          >
            <Image src="/logo-nexa.png" alt="Nexa" width={120} height={28} priority />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-2 pb-6 pt-4" role="navigation" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <div key={item.href} className="mb-2">
              {item.children?.length ? (
                <>
                  <button
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors ${
                      isActive(item.href) ? "bg-white/20" : "hover:bg-white/10"
                    }`}
                    onClick={() => toggle(item.href)}
                    aria-expanded={!!open[item.href]}
                    aria-controls={`section-${item.href}`}
                  >
                    <span className="flex items-center gap-2">
                      {item.icon && <span>{item.icon}</span>}
                      <span>{item.label}</span>
                    </span>
                    <span
                      aria-hidden
                      style={{
                        transform: open[item.href] ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "transform .15s",
                      }}
                    >
                      ▶
                    </span>
                  </button>
                  <div
                    id={`section-${item.href}`}
                    className="ml-4 mt-1 space-y-1"
                    style={{
                      maxHeight: open[item.href] ? 800 : 0,
                      overflow: "hidden",
                      transition: "max-height .2s ease",
                    }}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        className={`block px-3 py-2 rounded-md text-white/90 hover:bg-white/10 transition-colors ${
                          isActive(child.href) ? "bg-white/15 font-medium" : ""
                        }`}
                        href={child.href}
                        aria-current={isActive(child.href) ? "page" : undefined}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.href) ? "bg-white/20 font-medium" : "hover:bg-white/10"
                  }`}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  <span className="flex items-center gap-2">
                    {item.icon && <span>{item.icon}</span>}
                    <span>{item.label}</span>
                  </span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72">
        {/* Top Bar */}
        <div
          data-testid="layout-topbar"
          className="h-16 bg-white flex items-center px-6 gap-4 sticky top-0 z-10 border-b"
          style={{ borderColor: nexaTheme.colors.nexaBorder }}
        >
          <input
            type="search"
            placeholder="Search…"
            className="w-full max-w-[700px] rounded-xl px-4 py-2 outline-none border focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb]"
            style={{ borderColor: nexaTheme.colors.nexaBorder }}
            aria-label="Search"
          />
          <div className="ml-auto flex items-center gap-5" style={{ color: nexaTheme.colors.nexaMutedText }}>
            <Link href="/alerts" aria-label="Notifications" className="hover:opacity-70 transition-opacity">
              🔔
            </Link>
            <Link href="/help" aria-label="Help" className="hover:opacity-70 transition-opacity">
              ❓
            </Link>
            <Link href="/profile" aria-label="Profile" className="hover:opacity-70 transition-opacity">
              👤
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
              style={{ background: nexaTheme.colors.nexaPrimary }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="min-h-[calc(100vh-4rem)]">{children}</div>

        {/* AI Engine Bar (fixed bottom) */}
        <div data-testid="ai-engine-bar" className="fixed left-72 right-8 bottom-6 z-20">
          <AIAssistantBar />
        </div>
      </main>
    </div>
  );
}

function AIAssistantBar() {
  const [aiText, setAiText] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiReply, setAiReply] = useState<string | null>(null);
  const pathname = usePathname();

  const submitAi = useCallback(async () => {
    if (!aiText.trim()) return;
    setAiBusy(true);
    try {
      // Fire-and-forget audit
      fetch("/api/ai/audit/logs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: aiText, at: new Date().toISOString(), route: pathname }),
      }).catch(() => {});
      // Simple scoped response
      const scope = (pathname || "/").split("/")[1] || "dashboard";
      const msg = aiText.toLowerCase();
      let answer = `Working on ${scope}…`;
      if (msg.includes("invoice") || scope === "finance")
        answer = "Invoices this month: 168 · Overdue: 12 · Avg age: 23 days";
      else if (msg.includes("stock") || scope === "inventory")
        answer = "Inventory: 23,450 units · Low-stock SKUs: 14 · Next PO: #PO-10291";
      else if (msg.includes("lead") || scope === "sales")
        answer = "Leads: 42 open · 8 hot · Pipeline €405,280 (↑12.5%)";
      else if (msg.includes("payroll") || scope === "hr")
        answer = "Payroll run due Fri · 18 payslips pending approval";
      setAiReply(answer);
    } finally {
      setAiBusy(false);
      setAiText("");
    }
  }, [aiText, pathname]);

  return (
    <>
      <div
        className="bg-white rounded-2xl p-3 flex gap-2 shadow-lg"
        style={{
          border: `1px solid ${nexaTheme.colors.nexaBorder}`,
          boxShadow: nexaTheme.shadows.popover,
        }}
      >
        <input
          className="flex-1 px-4 py-3 rounded-xl outline-none border focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb]"
          style={{ borderColor: nexaTheme.colors.nexaBorder }}
          placeholder="Send a message…"
          value={aiText}
          onChange={(e) => setAiText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submitAi();
            }
          }}
          aria-label="AI Assistant Input"
        />
        <button
          onClick={submitAi}
          disabled={aiBusy}
          className="px-4 py-3 rounded-xl text-white transition-opacity disabled:opacity-60"
          style={{ background: nexaTheme.colors.nexaPrimary }}
        >
          {aiBusy ? "..." : "Send"}
        </button>
      </div>
      {aiReply && (
        <div
          className="mt-2 text-sm rounded-xl p-3 bg-white shadow-lg"
          style={{
            color: nexaTheme.colors.nexaMutedText,
            border: `1px solid ${nexaTheme.colors.nexaBorder}`,
            boxShadow: nexaTheme.shadows.card,
            width: "max(40%, 480px)",
          }}
        >
          {aiReply}
        </div>
      )}
    </>
  );
}

