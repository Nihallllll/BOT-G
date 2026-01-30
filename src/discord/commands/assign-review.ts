import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { userQueries } from '../../database/queries.js';
import { config } from '../../config/env.js';
import { prisma } from '../../database/client.js';
import { octokitClient } from '../../github/client.js';

export const assignReviewCommand = {
  data: new SlashCommandBuilder()
    .setName('assign-review')
    .setDescription('Assign a PR review to a user (Admin/Mentor only)')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to assign review to')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('repo')
        .setDescription('Repository name')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('pr')
        .setDescription('Pull Request number')
        .setRequired(true)
    ),
    
  async execute(interaction: ChatInputCommandInteraction) {
    const isAdmin = config.discord.adminIds.includes(interaction.user.id);
    const guild = interaction.guild;
    
    if (!guild) {
      return interaction.reply({ content: '❌ This command can only be used in a server.', ephemeral: true });
    }
    
    const member = await guild.members.fetch(interaction.user.id);
    const isMentor = config.discord.mentorRoleId && member.roles.cache.has(config.discord.mentorRoleId);
    
    if (!isAdmin && !isMentor) {
      return interaction.reply({
        content: '❌ Only admins and mentors can assign reviews.',
        ephemeral: true,
      });
    }
    
    const targetDiscordUser = interaction.options.getUser('user', true);
    const repo = interaction.options.getString('repo', true);
    const prNumber = interaction.options.getInteger('pr', true);
    
    const targetUser = await userQueries.findByDiscordId(targetDiscordUser.id);
    if (!targetUser?.githubUsername) {
      return interaction.reply({
        content: '❌ Target user has not linked their GitHub account.',
        ephemeral: true,
      });
    }
    
    const score = await prisma.score.findUnique({
      where: { userId: targetUser.id },
    });
    
    if (!score || score.totalPoints < config.permissions.reviewerPointsThreshold) {
      return interaction.reply({
        content: `❌ User needs at least ${config.permissions.reviewerPointsThreshold} points to be assigned reviews. Current: ${score?.totalPoints || 0}`,
        ephemeral: true,
      });
    }
    
    try {
      await octokitClient.rest.pulls.requestReviewers({
        owner: config.github.org,
        repo,
        pull_number: prNumber,
        reviewers: [targetUser.githubUsername],
      });
      
      await interaction.reply({
        content: `✅ Assigned PR review #${prNumber} in ${repo} to ${targetDiscordUser.username}\n` +
          `🔗 https://github.com/${config.github.org}/${repo}/pull/${prNumber}`,
      });
      
    } catch (error) {
      console.error('Error assigning review:', error);
      await interaction.reply({
        content: '❌ Failed to assign review. Check repo and PR number.',
        ephemeral: true,
      });
    }
  },
};
