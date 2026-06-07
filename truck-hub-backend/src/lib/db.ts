import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

declare global {
  var prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false  // required for Render PostgreSQL
    }
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const db = global.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") global.prisma = db