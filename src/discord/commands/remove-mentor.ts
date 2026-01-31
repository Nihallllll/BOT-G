import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
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
    await interaction.deferReply();
    
    if (!config.discord.adminIds.includes(interaction.user.id)) {
      return interaction.editReply({
        content: '❌ You do not have permission to use this command.',
      });
    }
    
    const targetUser = interaction.options.getUser('user', true);
    
    try {
      const guild = interaction.guild;
      if (!guild) {
        return interaction.editReply({ content: '❌ This command can only be used in a server.' });
      }
      
      if (!config.discord.mentorRoleId) {
        return interaction.editReply({ content: '❌ Mentor role is not configured.' });
      }
      
      const member = await guild.members.fetch(targetUser.id);
      await member.roles.remove(config.discord.mentorRoleId);
      
      await interaction.editReply({
        content: `✅ Successfully removed mentor role from ${targetUser.username}`,
      });
      
    } catch (error) {
      console.error('Error removing mentor:', error);
      await interaction.editReply({
        content: '❌ Failed to remove mentor. Please check permissions.',
      });
    }
  },
};
