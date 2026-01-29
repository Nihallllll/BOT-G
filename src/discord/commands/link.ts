import { SlashCommandBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';

export const linkCommand = {
  data: new SlashCommandBuilder()
    .setName('link-github')
    .setDescription('Link your Discord account to GitHub')
    .addStringOption(option =>
      option
        .setName('username')
        .setDescription('Your GitHub username')
        .setRequired(true)
    ),
    
  async execute(interaction: ChatInputCommandInteraction) {
    // Your logic here
    const username = interaction.options.getString('username', true);
    
    // 1. Validate username format
    // 2. Check if user already linked
    // 3. Check if GitHub username exists
    // 4. Generate verification token
    // 5. Send instructions
    
    await interaction.reply({
      content: 'Your linking instructions here...',
      ephemeral: true  // Only user sees this
    });
  },
};