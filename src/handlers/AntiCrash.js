const { EmbedBuilder, WebhookClient } = require('discord.js');
const Logger = require('../services/Logger');

module.exports = (client) => {
  const sendErrorLog = async (err, type) => {
    Logger.error(`[AntiCrash] ${type}`, err);

    if (!process.env.DEBUG_WEBHOOK_URL) return;

    try {
      const webhook = new WebhookClient({ url: process.env.DEBUG_WEBHOOK_URL });

      const embed = new EmbedBuilder()
        .setTitle(`🚨 Error: ${type}`)
        .setDescription(`\`\`\`js\n${(err.stack || err).toString().slice(0, 4000)}\n\`\`\``)
        .setColor(0xFF0000)
        .setTimestamp();

      await webhook.send({
        username: 'Bot Anti-Crash',
        embeds: [embed],
      });
    } catch (e) {
      console.error("Failed to send error to webhook", e);
    }
  };

  // 1. Unhandled Rejection (Async errors that weren't caught)
  process.on('unhandledRejection', (reason, promise) => {
    sendErrorLog(reason, 'Unhandled Rejection');
  });

  // 2. Uncaught Exception (Fatal sync errors)
  process.on('uncaughtException', (err) => {
    sendErrorLog(err, 'Uncaught Exception');
  });

  // 3. Uncaught Exception Monitor (For logging/monitoring before exit, if needed)
  process.on('uncaughtExceptionMonitor', (err, origin) => {
    sendErrorLog(err, 'Uncaught Exception Monitor');
  });
};