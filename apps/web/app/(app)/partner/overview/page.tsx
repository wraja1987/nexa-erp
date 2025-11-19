"use client";

import { useEffect, useState } from "react";
import Page from "@/components/layout/Page";

export const dynamic = "force-dynamic";

type Tenant = {
  id: string;
  name: string;
  createdAt: string;
};

type RevenueShare = {
  supported: boolean;
  partnerId?: string;
  partnerName?: string;
  sharePercentage: number;
  tenants: Array<{
    tenantId: string;
    tenantName: string;
    mrr: number;
    partnerShare: number;
    currency: string;
  }>;
  totalMrr: number;
  totalPartnerShare: number;
  currency: string;
  message?: string;
};

export default function PartnerOverviewPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [revenueShare, setRevenueShare] = useState<RevenueShare | null>(null);
  const [loading, setLoading] = useState(false);
  const [sharePercentage, setSharePercentage] = useState(20);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/partner/partners/list")
        .then((r) => r.json())
        .then((data) => {
          if (data.ok && data.data.tenants) {
            setTenants(data.data.tenants);
          }
        }),
      fetch(`/api/partner/revenue/preview?partnerId=all&sharePercentage=${sharePercentage}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.ok) {
            setRevenueShare(data.data);
          }
        }),
    ]).finally(() => setLoading(false));
  }, [sharePercentage]);

  if (loading) {
    return (
      <Page title="Partner Portal">
        <div className="col-span-12">Loading...</div>
      </Page>
    );
  }

  return (
    <Page title="Partner Portal">
      <div className="col-span-12 space-y-6">
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-lg font-semibold mb-4">All Tenants (Super-Admin View)</h2>
          {tenants.length === 0 ? (
            <div className="text-sm" style={{ color: "var(--color-muted)" }}>
              No tenants found
            </div>
          ) : (
            <div className="space-y-2">
              {tenants.map((t) => (
                <div key={t.id} className="border rounded p-3" style={{ borderColor: "var(--border)" }}>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-sm" style={{ color: "var(--color-muted)" }}>
                    ID: {t.id} | Created: {new Date(t.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-lg font-semibold mb-4">Revenue Share Preview</h2>
          <div className="mb-4">
            <label className="text-sm font-medium block mb-1">Share Percentage</label>
            <input
              type="number"
              min="0"
              max="100"
              value={sharePercentage}
              onChange={(e) => setSharePercentage(Number(e.target.value))}
              className="border rounded-md px-3 py-2 w-32"
            />
            <span className="ml-2">%</span>
          </div>
          {revenueShare && (
            <div className="space-y-4">
              {!revenueShare.supported && revenueShare.message && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-sm text-yellow-800">{revenueShare.message}</div>
                </div>
              )}
              {revenueShare.tenants.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Tenant Breakdown</h3>
                  <div className="space-y-2">
                    {revenueShare.tenants.map((t) => (
                      <div key={t.tenantId} className="border rounded p-3" style={{ borderColor: "var(--border)" }}>
                        <div className="font-medium">{t.tenantName}</div>
                        <div className="text-sm">
                          MRR: {t.currency} {t.mrr.toFixed(2)} | Partner Share: {t.currency}{" "}
                          {t.partnerShare.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <div className="font-medium">Total MRR:</div>
                  <div>
                    {revenueShare.currency} {revenueShare.totalMrr.toFixed(2)}
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <div className="font-medium">Total Partner Share ({revenueShare.sharePercentage}%):</div>
                  <div>
                    {revenueShare.currency} {revenueShare.totalPartnerShare.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}

