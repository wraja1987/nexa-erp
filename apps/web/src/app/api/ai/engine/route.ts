import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import { auditEvent } from "@/lib/observability/audit";
import { limiter } from "@/lib/security/ratelimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "0.0.0.0";
  const ok = await limiter.check( (session.user.id || ip), 20, "1m");
  if (!ok) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const { question, context } = body || {};
  const module = context?.module || "unknown";
  const submodule = context?.submodule || "unknown";

  await auditEvent("ai.query", {
    user: session.user.email,
    tenant: session.user.tenantId,
    module, submodule,
    qLen: (question||"").length
  });

  // TODO: Replace with real AI call. For now, echo with light guard.
  const safe = String(question || "").slice(0, 2000).replace(/(sk_live|password|secret)/gi, "[redacted]");
  const answer = `Nexa AI (demo): You asked about ${module}/${submodule}. Your question: "${safe}".`;

  return NextResponse.json({ answer });
}
