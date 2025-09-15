// Ensure Prisma has a DB to talk to in unit tests
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/optra?schema=public'
}






