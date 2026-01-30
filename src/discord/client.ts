import { Client, GatewayIntentBits, Events } from 'discord.js';
import { config } from '../config/env.js';

export const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

discordClient.once(Events.ClientReady, (client) => {
  console.log(`✅ Discord bot logged in as ${client.user.tag}`);
  console.log(`📊 Serving ${client.guilds.cache.size} servers`);
});

export async function loginDiscord() {
  await discordClient.login(config.discord.token);
}
