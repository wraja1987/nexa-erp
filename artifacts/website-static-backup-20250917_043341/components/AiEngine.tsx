"use client";
export default function AiEngine(){
  return (
    <div className="ai-wrap" style={{maxWidth:1200, margin:"12px auto"}}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/ai-engine-overview.png"
        alt="Nexa AI Engine Overview connecting modules like Finance, Inventory, WMS, Sales & CRM, Manufacturing, and Accounting"
        className="ai-img"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
