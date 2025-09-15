export default function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 text-center py-10">
      <div className="text-slate-900 font-medium">{title}</div>
      {hint ? <div className="text-slate-600 text-sm mt-1">{hint}</div> : null}
    </div>
  );
}




