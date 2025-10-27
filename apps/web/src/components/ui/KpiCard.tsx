"use client";
import React from "react";

type KpiCardProps = {
  label: string;
  value: string | number;
  sublabel?: string;
};

export default function KpiCard({ label, value, sublabel }: KpiCardProps) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div data-testid="kpi-value" className="mt-1 text-2xl font-bold">{value}</div>
      {sublabel ? <div className="mt-1 text-xs text-gray-400">{sublabel}</div> : null}
    </div>
  );
}
