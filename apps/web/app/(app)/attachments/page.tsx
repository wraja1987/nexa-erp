export const dynamic = "force-dynamic";
export const revalidate = 0;

import Page from "@/components/layout/Page";
import AttachmentPanel from "@/components/attachments/AttachmentPanel";

export default function AttachmentsPage() {
  return (
    <Page title="Attachments">
      <div className="col-span-12 space-y-6">
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-lg font-semibold mb-2">Attachments Hub</h2>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            View and manage attachments for entities across the system. Use the filters below to find attachments for a specific entity.
          </p>
        </div>

        <AttachmentPanel entityType="CustomerInvoice" entityId="demo-invoice-001" title="Sample Invoice Attachments" />
      </div>
    </Page>
  );
}

