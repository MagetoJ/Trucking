"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
function createPrismaClient() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is not set");
    }
    const pool = new pg_1.Pool({
        connectionString,
        ssl: {
            rejectUnauthorized: false // required for Render PostgreSQL
        }
    });
    const adapter = new adapter_pg_1.PrismaPg(pool);
    return new client_1.PrismaClient({ adapter });
}
exports.db = global.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production")
    global.prisma = exports.db;
