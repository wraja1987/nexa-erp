import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import Page from "@/components/layout/Page";
import PreferencesClient from "../../../components/profile/PreferencesClient";
import SecuritySection from "../../../components/profile/SecuritySection";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions as any).catch(()=>null);
  const user = (session as any)?.user || null;
  return (
    <Page title="Profile">
      <div className="col-span-12">
        <div className="rounded-2xl border bg-white p-6 space-y-6" style={{ borderColor: "var(--border)" }}>
          {user ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm" style={{ color: "var(--color-muted)" }}>Email</div>
                <div className="font-medium">{user.email}</div>
              </div>
              <div>
                <div className="text-sm" style={{ color: "var(--color-muted)" }}>Role</div>
                <div className="font-medium">{(user as any).role || "USER"}</div>
              </div>
              <div>
                <div className="text-sm" style={{ color: "var(--color-muted)" }}>Tenant</div>
                <div className="font-medium">{(user as any).tenantId || "N/A"}</div>
              </div>
            </div>
          ) : (
            <div className="text-sm" style={{ color: "var(--color-muted)" }}>No session detected.</div>
          )}

          {user && <SecuritySection email={String(user.email)} />}

          <PreferencesClient />
        </div>
      </div>
    </Page>
  );
}
