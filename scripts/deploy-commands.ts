import { REST, Routes } from 'discord.js';
import { config } from '../src/config/env.js';
import { linkCommand } from '../src/discord/commands/link.js';
import { findIssuesCommand } from '../src/discord/commands/find-issues.js';
import { claimIssueCommand } from '../src/discord/commands/claim-issue.js';
import { releaseIssueCommand } from '../src/discord/commands/release-issue.js';
import { myIssuesCommand } from '../src/discord/commands/my-issues.js';
import { myStatsCommand } from '../src/discord/commands/mystats.js';
import { leaderboardCommand } from '../src/discord/commands/leaderboard.js';
import { assignRoleCommand } from '../src/discord/commands/assign-role.js';
import { addMentorCommand } from '../src/discord/commands/add-mentor.js';
import { removeMentorCommand } from '../src/discord/commands/remove-mentor.js';
import { assignReviewCommand } from '../src/discord/commands/assign-review.js';

const commands = [
  linkCommand.data.toJSON(),
  findIssuesCommand.data.toJSON(),
  claimIssueCommand.data.toJSON(),
  releaseIssueCommand.data.toJSON(),
  myIssuesCommand.data.toJSON(),
  myStatsCommand.data.toJSON(),
  leaderboardCommand.data.toJSON(),
  assignRoleCommand.data.toJSON(),
  addMentorCommand.data.toJSON(),
  removeMentorCommand.data.toJSON(),
  assignReviewCommand.data.toJSON(),
];

const rest = new REST({ version: '10' }).setToken(config.discord.token);

async function deployCommands() {
  try {
    console.log('📤 Registering slash commands...');
    
    await rest.put(
      Routes.applicationCommands(config.discord.clientId),
      { body: commands },
    );
    
    console.log('✅ Successfully registered commands!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

deployCommands();
