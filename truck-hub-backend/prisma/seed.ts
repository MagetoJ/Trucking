// ✅ Import the shared db with adapter
import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // Securely hash the production administrative master password
  // Using bcryptjs for compatibility across the workspace
  const hashedPassword = await bcrypt.hash('AdminMaster2026!', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@truckhub.com' },
    update: {},
    create: {
      email: 'admin@truckhub.com',
      name: 'System Administrator',
      phone: '+254700000000',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      verified: true,
      rating: 5.0,
    },
  });

  console.log('🚀 Successfully initialized Super Admin credentials into the live database:');
  console.log(`Email: ${superAdmin.email}`);
  console.log(`Password: AdminMaster2026!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });