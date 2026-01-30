import { Events,type Interaction, type ChatInputCommandInteraction } from 'discord.js';
import { discordClient } from '../client.js';
import { linkCommand } from '../commands/link.js';
import { findIssuesCommand } from '../commands/find-issues.js';
import { claimIssueCommand } from '../commands/claim-issue.js';
import { releaseIssueCommand } from '../commands/release-issue.js';
import { myIssuesCommand } from '../commands/my-issues.js';
import { myStatsCommand } from '../commands/mystats.js';
import { leaderboardCommand } from '../commands/leaderboard.js';
import { assignRoleCommand } from '../commands/assign-role.js';
import { addMentorCommand } from '../commands/add-mentor.js';
import { removeMentorCommand } from '../commands/remove-mentor.js';
import { assignReviewCommand } from '../commands/assign-review.js';

const commands = new Map<string, any>([
  ['link-github', linkCommand],
  ['find-issues', findIssuesCommand],
  ['claim-issue', claimIssueCommand],
  ['release-issue', releaseIssueCommand],
  ['my-issues', myIssuesCommand],
  ['mystats', myStatsCommand],
  ['leaderboard', leaderboardCommand],
  ['assign-role', assignRoleCommand],
  ['add-mentor', addMentorCommand],
  ['remove-mentor', removeMentorCommand],
  ['assign-review', assignReviewCommand],
]);

export function registerInteractionHandler() {
  discordClient.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (interaction.isAutocomplete()) {
      const command = commands.get(interaction.commandName);
      if (command?.autocomplete) {
        try {
          await command.autocomplete(interaction);
        } catch (error) {
          console.error(`Error in autocomplete for ${interaction.commandName}:`, error);
        }
      }
      return;
    }
    
    if (!interaction.isChatInputCommand()) return;
    
    const command = commands.get(interaction.commandName);
    if (!command) return;
    
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}:`, error);
      
      const errorMessage = 'There was an error executing this command!';
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  });
}
