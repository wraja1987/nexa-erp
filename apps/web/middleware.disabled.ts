export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/((?!api/kpi|api/cache/revalidate|api/modules\.db|api/modules|_next|favicon\.ico).*)",
  ],
};
