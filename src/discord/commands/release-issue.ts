import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { userQueries, issueQueries } from '../../database/queries.js';
import { config } from '../../config/env.js';

export const releaseIssueCommand = {
  data: new SlashCommandBuilder()
    .setName('release-issue')
    .setDescription('Release an issue you can no longer work on')
    .addStringOption(option =>
      option
        .setName('repo')
        .setDescription('Repository name')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('number')
        .setDescription('Issue number')
        .setRequired(true)
    ),
    
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    
    const discordId = interaction.user.id;
    const repo = interaction.options.getString('repo', true);
    const number = interaction.options.getInteger('number', true);
    
    const user = await userQueries.findByDiscordId(discordId);
    if (!user?.githubUsername) {
      return interaction.editReply({
        content: 'You haven\'t linked your GitHub account!',
      });
    }
    
    try {
      await issueQueries.release(user.id, repo, number);
      
      const issueUrl = `https://github.com/${config.github.org}/${repo}/issues/${number}`;
      
      await interaction.editReply({
        content: `✅ Released issue #${number} in ${repo} from tracking.\n\n` +
          `⚠️ **Important:** Please manually unassign yourself on GitHub:\n` +
          `${issueUrl}\n\n` +
          `Click your username in the "Assignees" section and remove yourself.`,
      });
    } catch (error) {
      console.error('Error releasing issue:', error);
      await interaction.editReply({
        content: '❌ Error releasing issue. Please try again.',
      });
    }
  },
};
