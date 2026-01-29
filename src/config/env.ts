import dotenv from 'dotenv';
dotenv.config();

// Create a function that validates required env vars
function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// Export your config object
export const config = {
  discord: {
    token: getEnvVar('DISCORD_BOT_TOKEN'),
    clientId: getEnvVar('DISCORD_CLIENT_ID'),
    guildId: getEnvVar('DISCORD_GUILD_ID'),
  },
  github: {
    token: getEnvVar('GITHUB_TOKEN'),
  },
  database: {
    url: getEnvVar('DATABASE_URL'),
  },
  isDevelopment: process.env.NODE_ENV === 'development',
};