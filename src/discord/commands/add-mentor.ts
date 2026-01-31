import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
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
      await member.roles.add(config.discord.mentorRoleId);
      
      await interaction.editReply({
        content: `✅ Successfully promoted ${targetUser.username} to Mentor`,
      });
      
    } catch (error) {
      console.error('Error adding mentor:', error);
      await interaction.editReply({
        content: '❌ Failed to add mentor. Please check permissions.',
      });
    }
  },
};
