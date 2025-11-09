import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { postJournalEntry } from "@/server/finance/gl";

const Body = z.object({
  tenantId: z.string().optional(),
  docRef: z.string().optional(),
  memo: z.string().optional(),
  lines: z
    .array(
      z.object({
        accountCode: z.string().min(1),
        debitMinor: z.number().int().nonnegative().optional(),
        creditMinor: z.number().int().nonnegative().optional(),
      })
    )
    .min(2),
});

export async function POST(req: NextRequest) {
  try {
    await requirePermissionServer("finance:post_journal");
    const raw = await req.json().catch(async () => {
      const t = await req.text();
      return JSON.parse(t || "{}");
    });
    const body = Body.parse(raw);
    const { tenantId, userId } = await assertTenantScope(body.tenantId);
    const entry = await postJournalEntry({
      tenantId,
      actorId: userId,
      docRef: body.docRef,
      memo: body.memo,
      lines: body.lines,
    });
    return Response.json({ ok: true, entry });
  } catch (e: any) {
    const code = e?.code || 400;
    return Response.json({ ok: false, error: String(e?.message || "bad_request") }, { status: code });
  }
}


