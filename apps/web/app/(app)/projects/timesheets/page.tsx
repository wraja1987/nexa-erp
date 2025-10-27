import Page from "@/components/layout/Page";
import KpiCard from "@/components/ui/KpiCard";
export default function P(){return(<Page title="Timesheets">
  <KpiCard title="Revenue" value="€405,280" trend="12.5%" />
  <div className="col-span-12 md:col-span-8 bg-white border border-nexa-border rounded-2xl p-5 shadow-card">
    <div className="text-nexa-subtext mb-3">AI Insights</div>
    <div className="border rounded-xl p-4">Optimising labour costs could enhance your profit margins for the current quarter</div>
  </div>
  <div className="col-span-12 md:col-span-4 bg-white border border-nexa-border rounded-2xl p-5 shadow-card">
    <div className="text-nexa-subtext mb-3">Quick Links</div>
    <div className="grid grid-cols-2 gap-3">
      <button className="border rounded-xl py-3">New</button>
      <button className="border rounded-xl py-3">Run Report</button>
      <button className="border rounded-xl py-3">Import</button>
      <button className="border rounded-xl py-3">Export</button>
    </div>
  </div>
</Page>);}
