import { getServerSession } from "next-auth";
import { authOptions } from "./options";

export async function requireApiAuth<T>(handler: () => Promise<T>): Promise<T> {
  const session = await getServerSession(authOptions);
  if (!session) { throw Object.assign(new Error("Unauthorized"), { status: 401 }); }
  return handler();
}
// Back-compat name used in some files
export const requireAuth = requireApiAuth;
export default requireApiAuth;
