export async function requireAuth<T>(handler: () => Promise<T>): Promise<T> {
  return handler();
}
export async function requireApiAuth<T>(handler: () => Promise<T>): Promise<T> {
  return handler();
}
