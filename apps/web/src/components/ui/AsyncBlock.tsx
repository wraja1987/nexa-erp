"use client";
import { useEffect, useState } from "react";
export default function AsyncBlock({ load, children }: { load: () => Promise<any>, children: (data:any)=>JSX.Element }) {
  const [state, setState] = useState<{loading:boolean; error?:string; data?:any}>({loading:true});
  useEffect(()=>{ load().then(d=>setState({loading:false,data:d})).catch(e=>setState({loading:false,error:String(e)})); },[load]);
  if (state.loading) return <div className="rounded-xl border border-slate-200 p-6">Loading…</div>;
  if (state.error) return <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800">Error: {state.error}</div>;
  if (!state.data) return <div className="rounded-xl border border-dashed p-6">No data.</div>;
  return children(state.data);
}
