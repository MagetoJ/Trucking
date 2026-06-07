import { defineConfig } from 'prisma'
import dotenv from 'dotenv'

dotenv.config()

// Hardcoded fallback specifically for the local compilation engine if process environment parsing fails
const connectionString = process.env.DATABASE_URL || "postgresql://truck_hauling_user:KtKBjRlWuEfkJ1aglMvPLE6DWJyqqCKC@dpg-d8i368uq1p3s73e9ovpg-a.oregon-postgres.render.com/truck_hauling"

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: connectionString,
  },
})