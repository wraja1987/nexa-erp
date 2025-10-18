export const runtime = "nodejs";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/options";

export default NextAuth(authOptions);
