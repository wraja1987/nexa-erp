import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    '/((?!.+\.(?:png|jpg|jpeg|gif|svg|ico|css|js|woff2?)$)(?!api/auth)(?!_next)(?!fonts)(?!login).*)'
  ],
};
