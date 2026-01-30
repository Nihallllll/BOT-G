import { syncAllRoles } from '../src/core/roles.js';
import { prisma } from '../src/database/client.js';
import { loginDiscord, discordClient } from '../src/discord/client.js';

async function main() {
  try {
    await loginDiscord();
    
    await new Promise(resolve => {
      discordClient.once('ready', resolve);
    });
    
    await syncAllRoles();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    discordClient.destroy();
  }
}

main();
