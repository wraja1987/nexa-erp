import { PrismaClient } from "@prisma/client";
let prismaSingleton: PrismaClient | undefined;
export const prisma: PrismaClient = prismaSingleton ?? (prismaSingleton = new PrismaClient());
export default prisma;
