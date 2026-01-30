import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { config } from '../../config/env.js';

export const removeMentorCommand = {
  data: new SlashCommandBuilder()
    .setName('remove-mentor')
    .setDescription('Remove mentor role from a user (Admin only)')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to remove mentor role from')
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
      await member.roles.remove(config.discord.mentorRoleId);
      
      await interaction.reply({
        content: `✅ Successfully removed mentor role from ${targetUser.username}`,
      });
      
    } catch (error) {
      console.error('Error removing mentor:', error);
      await interaction.reply({
        content: '❌ Failed to remove mentor. Please check permissions.',
        ephemeral: true,
      });
    }
  },
};
