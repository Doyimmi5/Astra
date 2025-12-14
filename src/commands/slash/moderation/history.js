const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ModerationService = require('../../../services/Moderation');
const moment = require('moment'); // Optional, or use Discord timestamps

module.exports = {
  data: new SlashCommandBuilder()
    .setName('history')
    .setDescription('View moderation history of a user')
    .addUserOption(option => 
      option.setName('target').setDescription('The user to check').setRequired(true)
    ),

  async execute(interaction, client, config) {
    const target = interaction.options.getUser('target');

    await interaction.deferReply();

    try {
      // 1. Fetch data via Service
      const cases = await ModerationService.getHistory(interaction.guildId, target.id);

      // 2. Handle empty state
      if (!cases || cases.length === 0) {
        return interaction.editReply({ 
          content: `✅ **${target.tag}** has a clean record.` 
        });
      }

      // 3. Format the data for the Embed
      // We take the last 10 cases to avoid hitting Embed character limits
      // In a real production app, you would add pagination buttons here.
      const recentCases = cases.slice(0, 10);
      
      const description = recentCases.map(c => {
        // Discord Timestamp format: <t:UNIX_SECONDS:R> gives relative time (e.g., "2 days ago")
        const timestamp = Math.floor(new Date(c.timestamp).getTime() / 1000);
        return `**#${c.caseId}** | **${c.action}**\nReason: ${c.reason}\nMod: <@${c.moderatorId}> | <t:${timestamp}:R>`;
      }).join('\n\n');

      const embed = new EmbedBuilder()
        .setTitle(`Moderation History: ${target.tag}`)
        .setColor(0x2B2D31) // Discord dark theme color
        .setThumbnail(target.displayAvatarURL())
        .setDescription(description)
        .setFooter({ text: `Showing ${recentCases.length} of ${cases.length} total cases.` });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      await interaction.editReply('⚠ An error occurred while fetching history.');
    }
  },
};