import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";


// Public + auth routes that must NEVER be blocked by middleware
const PUBLIC_PATHS = [
  "/login",
  "/forgot-password",
  "/api/auth",
  "/favicon.ico",
  "/logo-nexa.png",
  "/images",
  "/icons",
];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}


export async function middleware(req: NextRequest) {
  const { pathname, origin, search } = req.nextUrl;

  // 1) Always allow public + NextAuth
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // 2) Try to read the NextAuth token, but NEVER crash if it fails
  let token: any = null;
  try {
    token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      // prod = true, but previews (vercel.app) must not crash
      secureCookie: process.env.NODE_ENV === "production",
    });
  } catch (err) {
    // swallow: no token means we’ll just redirect below
  }

  // 3) If no token, send user to /login on THIS origin, preserving callback
  if (!token) {
    const loginUrl = new URL("/login", origin);
    // preserve target (e.g. /dashboard)
    loginUrl.searchParams.set("callbackUrl", `${origin}${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  // 4) Valid token → continue
  return NextResponse.next();
}


// Apply to all routes except Next static, files, etc.
export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
