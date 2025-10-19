import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    // protect all routes except:
    "/((?!login|api/auth|_next|fonts|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)",
  ],
};
