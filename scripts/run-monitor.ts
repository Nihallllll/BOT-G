import { runMonitoring } from '../src/core/orchestrator.js';
import { prisma } from '../src/database/client.js';

async function main() {
  try {
    await runMonitoring();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
