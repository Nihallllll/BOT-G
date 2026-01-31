import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { userQueries, issueQueries } from '../../database/queries.js';
import { getIssue, assignIssue } from '../../github/issues.js';
import { config } from '../../config/env.js';

export const claimIssueCommand = {
  data: new SlashCommandBuilder()
    .setName('claim-issue')
    .setDescription('Claim a GitHub issue to work on')
    .addStringOption(option =>
      option
        .setName('repo')
        .setDescription('Repository name (e.g., Resonate)')
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
        content: '❌ Please link your GitHub account first: `/link-github`',
      });
    }
    
    try {
      const issue = await getIssue(repo, number);
      
      if (issue.assignees && issue.assignees.length > 0) {
        return interaction.editReply({
          content: `❌ Issue #${number} is already assigned.`,
        });
      }
      
      await assignIssue(repo, number, user.githubUsername);
      await issueQueries.assign(user.id, repo, number);
      
      await interaction.editReply({
        content: `✅ Successfully assigned issue #${number} in ${repo} to you!\n` +
          `🔗 https://github.com/${config.github.org}/${repo}/issues/${number}\n\n` +
          `Good luck! 🚀`,
      });
      
    } catch (error) {
      console.error('Error claiming issue:', error);
      await interaction.editReply({
        content: `❌ Could not assign issue. Make sure the repo and issue number are correct.`,
      });
    }
  },
};
