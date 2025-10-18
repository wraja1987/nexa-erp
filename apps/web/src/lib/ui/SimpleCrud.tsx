import React from "react";

type Row = { id: string; name: string; value: number; asOf: string };

export function SimpleCrud({ title, tag }: { title: string; tag: string }) {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [name, setName] = React.useState("");
  const [value, setValue] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(false);

  async function load() {
    setLoading(true);
    const r = await fetch(`/api/crud/kpi?tag=${encodeURIComponent(tag)}`);
    const j = await r.json();
    setRows(j.items || []);
    setLoading(false);
  }

  React.useEffect(() => { load(); }, [tag]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/crud/kpi`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: name || `${tag}:${Date.now()}`, value, tag })
    });
    setName(""); setValue(0);
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/crud/kpi?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <form onSubmit={create} className="flex items-end gap-3 mb-4">
        <div>
          <label className="block text-sm text-gray-700">Name</label>
          <input className="border rounded px-2 py-1" value={name} onChange={e=>setName(e.target.value)} placeholder={`${tag}:entry`}/>
        </div>
        <div>
          <label className="block text-sm text-gray-700">Value</label>
          <input className="border rounded px-2 py-1" type="number" step="0.01" value={value} onChange={e=>setValue(Number(e.target.value)||0)}/>
        </div>
        <button className="bg-blue-600 text-white px-3 py-2 rounded" type="submit">Create</button>
      </form>
      <div className="overflow-x-auto border rounded">
        <table role="table" className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-3 py-2">ID</th>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Value</th>
              <th className="text-left px-3 py-2">As Of</th>
              <th className="text-left px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=> (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">{r.id}</td>
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2">{r.value}</td>
                <td className="px-3 py-2">{new Date(r.asOf).toLocaleString()}</td>
                <td className="px-3 py-2">
                  <button onClick={()=>remove(r.id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr><td className="px-3 py-4 text-gray-500" colSpan={5}>No data yet. Create a record above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


