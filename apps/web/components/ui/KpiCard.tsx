export default function KpiCard({ title, value, trend }: { title: string; value: string; trend?: string }) {
  return (
    <div className="col-span-12 md:col-span-4 bg-white border border-nexa-border rounded-2xl p-5 shadow-card">
      <div className="text-nexa-subtext">{title}</div>
      <div className="text-3xl mt-2 font-semibold">{value}</div>
      {trend ? <div className="text-sm text-green-600 mt-2">↑ {trend}</div> : null}
    </div>
  );
}
