import express from 'express';
import { Octokit } from 'octokit';
import { config } from '../config/env.js';
import { userQueries } from '../database/queries.js';

const app = express();

const stateStorage = new Map<string, string>();

function generateStateToken(discordId: string): string {
  const state = Math.random().toString(36).substring(7);
  stateStorage.set(state, discordId);
  setTimeout(() => stateStorage.delete(state), 600000);
  return state;
}

function verifyStateToken(state: string): string | null {
  const discordId = stateStorage.get(state);
  if (discordId) {
    stateStorage.delete(state);
    return discordId;
  }
  return null;
}

app.get('/auth/start', (req, res) => {
  const discordId = req.query.discord_id as string;
  if (!discordId) {
    return res.status(400).send('Missing discord_id parameter');
  }
  
  const state = generateStateToken(discordId);
  
  const url = `https://github.com/login/oauth/authorize?` +
    `client_id=${config.github.oauth.clientId}&` +
    `state=${state}&` +
    `scope=user:email`;
  
  res.redirect(url);
});

app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;
  
  if (!code || !state) {
    return res.status(400).send('Missing code or state');
  }
  
  const discordId = verifyStateToken(state as string);
  if (!discordId) {
    return res.status(400).send('Invalid or expired state token');
  }
  
  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: config.github.oauth.clientId,
        client_secret: config.github.oauth.clientSecret,
        code,
      }),
    });
    
    const tokenData : any = await tokenResponse.json();
    const accessToken = tokenData.access_token ;
    
    if (!accessToken) {
      return res.status(500).send('Failed to get access token');
    }
    
    const octokit = new Octokit({ auth: accessToken });
    const { data: user } = await octokit.rest.users.getAuthenticated();
    
    let dbUser = await userQueries.findByDiscordId(discordId);
    if (!dbUser) {
      dbUser = await userQueries.createUser(discordId);
    }
    
    await userQueries.linkGithub(discordId, user.login);
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>GitHub Linked</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              text-align: center;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }
            h1 { color: #667eea; margin-bottom: 20px; }
            p { color: #666; font-size: 18px; }
            .checkmark { font-size: 60px; color: #4CAF50; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="checkmark">✓</div>
            <h1>Successfully Linked!</h1>
            <p>Your Discord account is now linked to GitHub user <strong>${user.login}</strong></p>
            <p>You can close this window and return to Discord.</p>
          </div>
        </body>
      </html>
    `);
    
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).send('Failed to link GitHub account');
  }
});

export function startOAuthServer() {
  app.listen(config.server.port, () => {
    console.log(`🌐 OAuth server running on http://localhost:${config.server.port}`);
  });
}
