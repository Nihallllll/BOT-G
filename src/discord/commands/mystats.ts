import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { userQueries, contributionQueries } from '../../database/queries.js';
import { prisma } from '../../database/client.js';

export const myStatsCommand = {
  data: new SlashCommandBuilder()
    .setName('mystats')
    .setDescription('View your contribution statistics'),
    
  async execute(interaction: ChatInputCommandInteraction) {
    const user = await userQueries.findByDiscordId(interaction.user.id);
    
    if (!user?.githubUsername) {
      return interaction.reply({
        content: 'Link your GitHub account first: `/link-github`',
        ephemeral: true,
      });
    }
    
    const score = await prisma.score.findUnique({
      where: { userId: user.id },
    });
    
    if (!score) {
      return interaction.reply({
        content: 'No stats yet! Start contributing to earn points.',
        ephemeral: true,
      });
    }
    
    const prCount = await contributionQueries.countByUser(user.id, 'pr');
    const reviewCount = await contributionQueries.countByUser(user.id, 'review');
    const issueCount = await contributionQueries.countByUser(user.id, 'issue');
    
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`📊 Stats for ${interaction.user.username}`)
      .addFields(
        { name: '🏆 Total Points', value: score.totalPoints.toString(), inline: true },
        { name: '📈 Rank', value: `#${score.rank}`, inline: true },
        { name: '🔥 Current Streak', value: `${score.currentStreak} days`, inline: true },
        { name: '🔀 Pull Requests', value: prCount.toString(), inline: true },
        { name: '👀 Code Reviews', value: reviewCount.toString(), inline: true },
        { name: '📝 Issues', value: issueCount.toString(), inline: true },
      )
      .setFooter({ text: `Linked GitHub: ${user.githubUsername}` })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  },
};
