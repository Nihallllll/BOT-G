import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { scoreQueries } from '../../database/queries.js';

export const leaderboardCommand = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the contribution leaderboard'),
    
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    
    const topUsers = await scoreQueries.getLeaderboard(10);
    
    if (topUsers.length === 0) {
      return interaction.editReply('No data yet!');
    }
    
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🏆 Leaderboard - All Time');
    
    const medals = ['🥇', '🥈', '🥉'];
    
    for (let i = 0; i < topUsers.length; i++) {
      const userData = topUsers[i];
      const medal = i < 3 ? medals[i] : `${i + 1}.`;
      
      try {
        const discordUser = await interaction.client.users.fetch(userData.user.discordId);
        
        embed.addFields({
          name: `${medal} ${discordUser.username}`,
          value: `${userData.totalPoints} points`,
          inline: false,
        });
      } catch (error) {
        console.error(`Could not fetch user ${userData.user.discordId}`);
      }
    }
    
    await interaction.editReply({ embeds: [embed] });
  },
};
