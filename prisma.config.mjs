import { defineConfig } from 'prisma/config'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: connectionString,
  },
})