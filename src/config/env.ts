import dotenv from 'dotenv';
dotenv.config();

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  discord: {
    token: getEnvVar('DISCORD_BOT_TOKEN'),
    clientId: getEnvVar('DISCORD_CLIENT_ID'),
    guildId: getEnvVar('DISCORD_GUILD_ID'),
    adminIds: process.env.DISCORD_ADMIN_IDS?.split(',').map(id => id.trim()) || [],
    mentorRoleId: process.env.DISCORD_MENTOR_ROLE_ID || '',
  },
  github: {
    token: getEnvVar('GITHUB_TOKEN'),
    org: process.env.GITHUB_ORG || 'AOSSIE-Org',
    oauth: {
      clientId: getEnvVar('GITHUB_OAUTH_CLIENT_ID'),
      clientSecret: getEnvVar('GITHUB_OAUTH_CLIENT_SECRET'),
      callbackUrl: process.env.OAUTH_CALLBACK_URL || 'http://localhost:3000/auth/callback',
    },
  },
  database: {
    url: getEnvVar('DATABASE_URL'),
  },
  server: {
    port: parseInt(process.env.PORT || '3000'),
  },
  permissions: {
    reviewerPointsThreshold: parseInt(process.env.REVIEWER_POINTS_THRESHOLD || '100'),
  },
  isDevelopment: process.env.NODE_ENV === 'development',
};
