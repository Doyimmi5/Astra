const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../database/schemas/GuildConfig');
const Logger = require('./Logger');

class LogService {
  async sendModLog(client, guild, caseData) {
    try {
      // 1. Fetch Config
      // Note: In a real app, use the cache from BotClient we built earlier
      const config = await GuildConfig.findOne({ guildId: guild.id });
      
      if (!config || !config.logChannelId) return; // Logging not setup

      // 2. Fetch Channel
      const channel = await guild.channels.fetch(config.logChannelId).catch(() => null);
      if (!channel) return;

      // 3. Build Embed
      const embed = new EmbedBuilder()
        .setTitle(`Case #${caseData.caseId} | ${caseData.action}`)
        .addFields(
          { name: 'Target', value: `<@${caseData.targetId}>`, inline: true },
          { name: 'Moderator', value: `<@${caseData.moderatorId}>`, inline: true },
          { name: 'Reason', value: caseData.reason }
        )
        .setTimestamp()
        .setFooter({ text: `ID: ${caseData.targetId}` });

      // Color coding based on action
      switch (caseData.action) {
        case 'WARN': embed.setColor(0xFFAA00); break; // Orange
        case 'BAN': embed.setColor(0xFF0000); break;  // Red
        case 'KICK': embed.setColor(0xFF5500); break; // Dark Orange
        default: embed.setColor(0x0099FF);            // Blue
      }

      // 4. Send
      await channel.send({ embeds: [embed] });

    } catch (error) {
      // We do not throw here because logging failure shouldn't stop the bot
      Logger.error(`Failed to send log for case ${caseData.caseId}`, error);
    }
  }
}

module.exports = new LogService();