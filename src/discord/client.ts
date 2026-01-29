import { Client, GatewayIntentBits, Events } from 'discord.js';
import { config } from '../config/env';

export const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

// Event: Bot is ready 
discordClient.once(Events.ClientReady, (client) => {
  console.log(`✅ Discord bot logged in as ${client.user.tag}`);
});

// Login function
export async function loginDiscord() {
  await discordClient.login(config.discord.token);
}