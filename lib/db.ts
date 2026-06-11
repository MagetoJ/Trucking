import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

declare global {
  // Prevent multiple instances of Prisma Client in development to avoid pool exhaustion
  var prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false // Required for secure production databases like Render
    }
  })
  
  const adapter = new PrismaPg(pool)
  
  // Pass the valid driver adapter options object to comply with Prisma 7
  return new PrismaClient({ adapter })
}

export const db = global.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') global.prisma = db