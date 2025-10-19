import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    "/((?!login|api/auth|_next|fonts|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)",
  ],
};
