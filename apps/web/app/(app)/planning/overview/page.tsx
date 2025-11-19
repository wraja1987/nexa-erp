export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { assertTenantScope } from "@/lib/auth/tenant.server";
import { requirePermissionServer } from "@/lib/auth/guards.server";

export default async function PlanningOverviewPage() {
  await requirePermissionServer("ui:planning:view");
  const { tenantId } = await assertTenantScope();

  return (
    <>
      <PageHeader
        title="Planning / S&OP Overview"
        breadcrumb={[{ label: "Planning" }]}
        actions={
          <>
            <Link href="/planning/recommendations">
              <Button variant="primary" size="sm">
                View Recommendations
              </Button>
            </Link>
          </>
        }
      />

      <main className="space-y-4 px-8 pb-24">
        <Alert variant="info" title="Planning / S&OP">
          The Planning module provides demand and supply planning, capacity views, and suggested actions (POs, WOs, transfers).
          All planning calculations are read-only and additive—no automatic changes to core state.
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/planning/demand">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader title="Demand Planning" />
              <CardContent>
                <p className="text-nexaMutedText text-sm">View demand signals by item, warehouse, and time bucket</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/planning/supply">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader title="Supply Planning" />
              <CardContent>
                <p className="text-nexaMutedText text-sm">View on-hand, open POs, open WOs, and safety stock</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/planning/recommendations">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader title="Recommendations" />
              <CardContent>
                <p className="text-nexaMutedText text-sm">Suggested POs, WOs, and transfers based on net requirements</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/planning/capacity">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader title="Capacity View" />
              <CardContent>
                <p className="text-nexaMutedText text-sm">Work centre capacity vs allocated load</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Card>
          <CardHeader title="Quick Links" />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/planning/demand?horizonMonths=3&bucket=month" className="text-nexaPrimary hover:underline">
                Demand Plan (3 months, monthly buckets)
              </Link>
              <Link href="/planning/supply?horizonMonths=3&bucket=month" className="text-nexaPrimary hover:underline">
                Supply Plan (3 months, monthly buckets)
              </Link>
              <Link href="/planning/recommendations?horizonMonths=3" className="text-nexaPrimary hover:underline">
                All Recommendations (3 months)
              </Link>
              <Link href="/planning/capacity?horizonMonths=1&bucket=week" className="text-nexaPrimary hover:underline">
                Capacity View (1 month, weekly buckets)
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

