export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Page from "@/components/layout/Page";
import ClientGate from "./ClientGate";

export default async function FinanceReportsPage() {
  return (
    <Page title="Finance Reports">
      <ClientGate />
    </Page>
  );
}
