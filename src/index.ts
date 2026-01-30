import { loginDiscord } from './discord/client.js';
import { registerInteractionHandler } from './discord/events/interactionCreate.js';
import { prisma } from './database/client.js';
import { startOAuthServer } from './oauth/server.js';

async function main() {
  try {
    console.log('🚀 Starting AOSSIE bot...');
    
    await prisma.$connect();
    console.log('✅ Database connected');
    
    registerInteractionHandler();
    console.log('✅ Discord handlers registered');
    
    await loginDiscord();
    
    startOAuthServer();
    
    console.log('✅ Bot is ready!');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
