import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/options";

export const runtime = "nodejs";
export default NextAuth(authOptions);
