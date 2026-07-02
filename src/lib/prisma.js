import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';

// Singleton pattern to reuse Prisma client across requests
let prisma = null;

function createPrismaClient() {
  // DATABASE_URL format: "file:./dev.db"
  // We need to extract the file path and handle it properly
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Extract the file path from the URL
  // Format could be "file:./dev.db" or "file:C:\path\to\dev.db"
  let dbPath = databaseUrl;
  
  if (dbPath.startsWith('file:')) {
    dbPath = dbPath.substring(5); // Remove "file:" prefix
  }

  // Convert relative paths to absolute paths
  if (!path.isAbsolute(dbPath)) {
    dbPath = path.join(process.cwd(), dbPath);
  }

  const db = new Database(dbPath);
  const adapter = new PrismaBetterSqlite3(db);
  
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
