import { NextRequest, NextResponse } from "next/server";

const SOFT_GUARD_PATHS = ["/finance/reports"];
const LOGIN_PATH = "/login";

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Always bypass NextAuth's auth routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Require login everywhere except the login page itself
  const isLoggedIn =
    req.cookies.has("next-auth.session-token") ||
    req.cookies.has("__Secure-next-auth.session-token");

  if (!isLoggedIn && pathname !== LOGIN_PATH) {
    const url = req.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.search = "";
    url.searchParams.set("callbackUrl", pathname + (search || ""));
    return NextResponse.redirect(url);
  }

  // IMPORTANT: let these routes fall through to the page.
  if (SOFT_GUARD_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
