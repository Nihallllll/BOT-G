
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { config } from '../config/env';
import { PrismaClient } from '../../generated/prisma/client';

// Create connection pool
const pool = new Pool({
  connectionString: config.database.url,
});

// Create adapter
const adapter = new PrismaPg(pool);

// Create Prisma client
export const prisma = new PrismaClient({ adapter });

// Handle shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});