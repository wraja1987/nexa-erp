export async function parseBody<T=unknown>(req: Request): Promise<T> {
  try { return (await req.json()) as T; } catch { return {} as T; }
}
export default parseBody;
