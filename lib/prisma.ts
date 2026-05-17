import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for hosted DBs (Supabase/Neon/Railway)
  max: 10,                            // connection pool ceiling
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,      // fail fast instead of hanging until P2028
});

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: new PrismaPg(pool),      // ← pass the Pool instance, not a config object
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;