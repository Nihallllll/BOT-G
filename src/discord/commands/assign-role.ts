import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { config } from '../../config/env.js';

export const assignRoleCommand = {
  data: new SlashCommandBuilder()
    .setName('assign-role')
    .setDescription('Assign a role to a user (Admin only)')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to assign role to')
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('Role to assign')
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
    const role = interaction.options.getRole('role', true);
    
    try {
      const guild = interaction.guild;
      if (!guild) {
        return interaction.reply({ content: '❌ This command can only be used in a server.', ephemeral: true });
      }
      
      const member = await guild.members.fetch(targetUser.id);
      await member.roles.add(role.id);
      
      await interaction.reply({
        content: `✅ Successfully assigned **${role.name}** to ${targetUser.username}`,
      });
      
    } catch (error) {
      console.error('Error assigning role:', error);
      await interaction.reply({
        content: '❌ Failed to assign role. Please check permissions.',
        ephemeral: true,
      });
    }
  },
};
