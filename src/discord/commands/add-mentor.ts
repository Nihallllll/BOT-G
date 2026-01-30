import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { config } from '../../config/env.js';

export const addMentorCommand = {
  data: new SlashCommandBuilder()
    .setName('add-mentor')
    .setDescription('Add a user as mentor (Admin only)')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to promote to mentor')
        .setRequired(true)
    ),
    
  async execute(interaction: ChatInputCommandInteraction) {
    if (!config.discord.adminIds.includes(interaction.user.id)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true,
      });
    }
    
    const targetUser = interaction.options.getUser('user', true);
    
    try {
      const guild = interaction.guild;
      if (!guild) {
        return interaction.reply({ content: '❌ This command can only be used in a server.', ephemeral: true });
      }
      
      if (!config.discord.mentorRoleId) {
        return interaction.reply({ content: '❌ Mentor role is not configured.', ephemeral: true });
      }
      
      const member = await guild.members.fetch(targetUser.id);
      await member.roles.add(config.discord.mentorRoleId);
      
      await interaction.reply({
        content: `✅ Successfully promoted ${targetUser.username} to Mentor`,
      });
      
    } catch (error) {
      console.error('Error adding mentor:', error);
      await interaction.reply({
        content: '❌ Failed to add mentor. Please check permissions.',
        ephemeral: true,
      });
    }
  },
};
