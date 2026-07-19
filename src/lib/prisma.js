import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// Singleton pattern to reuse Prisma client across requests
let prisma = null;

function createPrismaClient() {
  // DATABASE_URL format: "file:./dev.db"
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Prisma 7 adapter takes a config object with the URL
  const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
  
  return new PrismaClient({ adapter });
}

if (typeof global !== 'undefined') {
  if (process.env.NODE_ENV === 'production') {
    if (!prisma) {
      prisma = createPrismaClient();
    }
  } else {
    if (!global.prismaClient) {
      global.prismaClient = createPrismaClient();
    }
    if (global.prismaClient) {
      prisma = global.prismaClient;
    }
  }
}

export default prisma;

