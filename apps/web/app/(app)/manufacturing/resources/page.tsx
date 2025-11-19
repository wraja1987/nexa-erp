import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Manufacturing — Resources"
        breadcrumb={[
          { label: "Manufacturing", href: "/manufacturing" },
          { label: "Resources" },
        ]}
      />
      <main className="space-y-4 px-8 pb-24">
        <Card>
          <CardContent>
            <p className="text-sm" style={{ color: "#6b7280" }}>
              This is the Nexa Manufacturing — Resources workspace.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
