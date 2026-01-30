import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { userQueries, issueQueries } from '../../database/queries.js';
import { unassignIssue } from '../../github/issues.js';

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
    const discordId = interaction.user.id;
    const repo = interaction.options.getString('repo', true);
    const number = interaction.options.getInteger('number', true);
    
    const user = await userQueries.findByDiscordId(discordId);
    if (!user?.githubUsername) {
      return interaction.reply({
        content: 'You haven\'t linked your GitHub account!',
        ephemeral: true,
      });
    }
    
    try {
      await unassignIssue(repo, number, user.githubUsername);
      await issueQueries.release(user.id, repo, number);
      
      await interaction.reply({
        content: `✅ Released issue #${number} in ${repo}. Thanks for letting us know!`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error releasing issue:', error);
      await interaction.reply({
        content: '❌ Error releasing issue. Please try again.',
        ephemeral: true,
      });
    }
  },
};
