import { SlashCommandBuilder, ChatInputCommandInteraction, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { userQueries } from '../../database/queries.js';
import { config } from '../../config/env.js';

export const linkCommand = {
  data: new SlashCommandBuilder()
    .setName('link-github')
    .setDescription('Link your Discord account to GitHub'),
    
  async execute(interaction: ChatInputCommandInteraction) {
    const discordId = interaction.user.id;
    
    const user = await userQueries.findByDiscordId(discordId);
    if (user?.githubUsername) {
      return interaction.reply({
        content: `You're already linked to GitHub user: **${user.githubUsername}**`,
        ephemeral: true,
      });
    }
    
    const oauthUrl = `${config.github.oauth.callbackUrl.replace('/auth/callback', '')}/auth/start?discord_id=${discordId}`;
    
    const button = new ButtonBuilder()
      .setLabel('Link GitHub Account')
      .setStyle(ButtonStyle.Link)
      .setURL(oauthUrl);
    
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
    
    await interaction.reply({
      content: '🔗 Click the button below to link your GitHub account:',
      components: [row],
      ephemeral: true,
    });
  },
};
