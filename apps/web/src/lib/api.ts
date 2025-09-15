export const API_BASE =
  process.env.NEXA_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3000";

export type Ok<T> = { data: T; error: null };
export type Err = { data: null; error: { status: number; message: string } };
export type ApiResult<T> = Ok<T> | Err;

function normalise(path: string): string {
  if (path.startsWith("http")) return path;
  const base = API_BASE.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return `${base}/${p}`;
}

export async function getJSON<T = any>(
  path: string,
  init: RequestInit = {}
): Promise<ApiResult<T>> {
  const url = normalise(path);
  try {
    const res = await fetch(url, {
      ...init,
      headers: { "accept": "application/json", ...(init.headers || {}) },
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { data: null, error: { status: res.status, message: text || res.statusText } };
    }
    const json = (await res.json()) as T;
    return { data: json, error: null };
  } catch (e: any) {
    return { data: null, error: { status: 0, message: e?.message ?? "Network error" } };
  }
}







