import { NextRequest } from "next/server";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";
import { getAvailableToolsForModule } from "@/server/ai/agent/tools";
import { isAgentEnabledForTenant } from "@/server/ai/config";
import { captureError } from "@/server/observability/sentry";

export async function GET(req: NextRequest) {
  try {
    await requirePermissionServer("ui:ai:admin");
    const { tenantId } = await assertTenantScope();

    // Check if agent is enabled
    const enabled = await isAgentEnabledForTenant(tenantId);
    if (!enabled) {
      return Response.json(
        {
          ok: false,
          error: "Agent features are disabled. Set AGENT_ENABLED=true to enable.",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const module = searchParams.get("module") || undefined;

    const tools = getAvailableToolsForModule(module);

    // Return tool metadata (without run function)
    const toolMetadata = tools.map((t) => ({
      name: t.name,
      module: t.module,
      description: t.description,
      inputSchema: t.inputSchema,
      readOnly: t.readOnly,
    }));

    return Response.json({
      ok: true,
      tools: toolMetadata,
    });
  } catch (error: any) {
    captureError(error, { module: "agent", operation: "get_tools" });
    const code = error?.code || 500;
    return Response.json({ ok: false, error: String(error?.message || "internal_error") }, { status: code });
  }
}

