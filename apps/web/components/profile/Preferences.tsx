"use client";
import * as React from "react";

export default function Preferences() {
  const [tz, setTz] = React.useState<string>(()=>localStorage.getItem("nexa:tz")||"Europe/London");
  const [ccy, setCcy] = React.useState<string>(()=>localStorage.getItem("nexa:ccy")||"GBP");
  const [theme, setTheme] = React.useState<string>(()=>localStorage.getItem("nexa:theme")||"light");
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)" }}>
      <div className="font-medium mb-2">Preferences</div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm">Timezone
          <select className="block mt-1 border rounded-md px-2 py-1 w-full" value={tz} onChange={(e)=>setTz(e.target.value)}>
            <option>Europe/London</option>
            <option>Europe/Dublin</option>
            <option>Europe/Paris</option>
            <option>America/New_York</option>
          </select>
        </label>
        <label className="text-sm">Currency
          <select className="block mt-1 border rounded-md px-2 py-1 w-full" value={ccy} onChange={(e)=>setCcy(e.target.value)}>
            <option>GBP</option>
            <option>EUR</option>
            <option>USD</option>
          </select>
        </label>
        <label className="text-sm">Theme
          <select className="block mt-1 border rounded-md px-2 py-1 w-full" value={theme} onChange={(e)=>setTheme(e.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </div>
      <button className="mt-3 px-4 py-2 rounded-lg text-white" style={{ background: "var(--color-blue)" }} onClick={()=>{localStorage.setItem("nexa:tz",tz);localStorage.setItem("nexa:ccy",ccy);localStorage.setItem("nexa:theme",theme);}}>Save</button>
    </div>
  );
}
