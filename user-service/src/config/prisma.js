// SINGLETON DESIGN PATTERN IMPLEMENTATION FOR PRISMA CLIENT
// why singleton? because we want to have a single instance of Prisma client throughout the application to avoid multiple connections and manage resources efficiently.

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import {config} from './/index.js';
const connectionString = config.DATABASE_URL;

const globalForPrisma = global;

if (!globalForPrisma.prisma) {
  const adapter = new PrismaPg({ connectionString });

  globalForPrisma.prisma = new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  });
}

const prisma = globalForPrisma.prisma;

export default prisma;
