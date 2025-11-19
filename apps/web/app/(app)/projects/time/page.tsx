import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Projects — Time"
        breadcrumb={[
          { label: "Projects", href: "/projects" },
          { label: "Time" },
        ]}
      />
      <main className="space-y-4 px-8 pb-24">
        <Card>
          <CardContent>
            <p className="text-sm" style={{ color: "#6b7280" }}>
              This is the Nexa Projects — Time workspace.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
