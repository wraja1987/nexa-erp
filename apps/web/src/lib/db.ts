// Stubbed prisma for web build to avoid bringing Prisma client into the browser/server bundle.
// Use API routes with `pg` for data access in this app.
export const prisma: any = new Proxy({}, {
  get() {
    throw new Error('Prisma client not available in apps/web build. Use API routes backed by pg.');
  }
});






