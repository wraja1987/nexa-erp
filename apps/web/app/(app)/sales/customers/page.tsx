import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Sales — Customers"
        breadcrumb={[
          { label: "Sales & CRM", href: "/sales" },
          { label: "Customers" },
        ]}
      />
      <main className="space-y-4 px-8 pb-24">
        <Card>
          <CardContent>
            <p className="text-sm" style={{ color: "#6b7280" }}>
              This is the Nexa Sales — Customers workspace.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
