import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { listIssuesForRepo } from '../../github/issues.js';
import { getAllRepositories } from '../../github/repositories.js';

export const findIssuesCommand = {
  data: new SlashCommandBuilder()
    .setName('find-issues')
    .setDescription('Find GitHub issues to work on')
    .addStringOption(option =>
      option
        .setName('repo')
        .setDescription('Repository name')
        .setRequired(true)
        .setAutocomplete(true)
    ),
    
  async autocomplete(interaction: any) {
    try {
      const focusedValue = interaction.options.getFocused();
      const repos = await getAllRepositories();
      
      const filtered = repos
        .map(r => ({ name: r.name, value: r.name }))
        .filter(r => r.name.toLowerCase().includes(focusedValue.toLowerCase()))
        .slice(0, 25);
      
      await interaction.respond(filtered);
    } catch (error) {
      await interaction.respond([]);
    }
  },
    
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    
    const repo = interaction.options.getString('repo', true);
    
    try {
      const issues = await listIssuesForRepo(repo);
      
      const openIssues = issues
        .filter(issue => !issue.assignee && !issue.assignees?.length)
        .slice(0, 5);
      
      if (openIssues.length === 0) {
        return interaction.editReply(`No open unassigned issues found in ${repo}`);
      }
      
      const embed = new EmbedBuilder()
        .setColor('#0066FF')
        .setTitle(`📋 Available Issues in ${repo}`)
        .setDescription(`Latest ${openIssues.length} open unassigned issues:`);
      
      for (const issue of openIssues) {
        embed.addFields({
          name: `#${issue.number} - ${issue.title}`,
          value: `[View on GitHub](${issue.html_url})`,
          inline: false,
        });
      }
      
      embed.setFooter({ text: 'Use /claim-issue to assign an issue to yourself' });
      
      await interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error finding issues:', error);
      await interaction.editReply('❌ Error searching for issues. Please try again later.');
    }
  },
};
