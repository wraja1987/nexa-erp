export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";
import { getSessionContext } from "@/lib/auth/tenant.server";
import ClientGate from "./ClientGate";

export default async function FinanceReportsPage() {
  const { tenantId } = await getSessionContext();
  return (
    <Page title="Finance Reports">
      <div className="col-span-12">
        <div className="text-sm mb-2" style={{ color: "var(--color-muted)" }}>
          Tenant scope: <span className="font-medium">{tenantId}</span>
        </div>
      </div>
      <ClientGate />
    </Page>
  );
}
