export async function postJSON<T = any>(url: string, body: any, provisional?: (draft: any) => void): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`POST ${url} failed ${res.status}`);
  const data = await res.json();
  if (data?.provisional && provisional) provisional(data.resource);
  return data as T;
}
