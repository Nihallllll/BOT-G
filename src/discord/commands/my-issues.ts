import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { userQueries, issueQueries } from '../../database/queries.js';
import { config } from '../../config/env.js';

export const myIssuesCommand = {
  data: new SlashCommandBuilder()
    .setName('my-issues')
    .setDescription('View all issues assigned to you'),
    
  async execute(interaction: ChatInputCommandInteraction) {
    const user = await userQueries.findByDiscordId(interaction.user.id);
    if (!user?.githubUsername) {
      return interaction.reply({
        content: 'You haven\'t linked your GitHub account yet! Use `/link-github`',
        ephemeral: true,
      });
    }
    
    const assigned = await issueQueries.getUserIssues(user.id);
    
    if (assigned.length === 0) {
      return interaction.reply({
        content: 'You don\'t have any assigned issues. Use `/find-issues` to find some!',
        ephemeral: true,
      });
    }
    
    const embed = new EmbedBuilder()
      .setColor('#0066FF')
      .setTitle('📌 Your Assigned Issues')
      .setDescription(`You have ${assigned.length} active issue(s)`);
    
    for (const issue of assigned) {
      const url = `https://github.com/${config.github.org}/${issue.repoName}/issues/${issue.issueNumber}`;
      embed.addFields({
        name: `#${issue.issueNumber} - ${issue.repoName}`,
        value: `[View on GitHub](${url})`,
        inline: true,
      });
    }
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
