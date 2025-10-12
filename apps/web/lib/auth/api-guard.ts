export async function requireAuth<T>(handler: () => Promise<T>): Promise<T> {
  // TODO: replace with real auth; this stub just proceeds.
  return handler();
}
