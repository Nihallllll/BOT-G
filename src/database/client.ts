
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { config } from '../config/env.js';
import { PrismaClient } from '../../generated/prisma/client.js';

const pool = new Pool({
  connectionString: config.database.url,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

process.on('beforeExit', async () => {
  await prisma.$disconnect();
  await pool.end();
});
